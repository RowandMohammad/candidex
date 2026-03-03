import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { extractTextFromFile, parseCvToJsonResume, runHealthScan } from '@/lib/modules/cv-ingest';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
            return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' }, { status: 400 });
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1. Extract text
        const rawText = await extractTextFromFile(buffer, file.name);

        if (!rawText || rawText.length < 50) {
            return NextResponse.json(
                { error: 'Could not extract sufficient text from the file. Please try a different format.' },
                { status: 422 },
            );
        }

        // 2. Upload original to storage
        const storagePath = `${user.id}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
            .from('cv-originals')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            // Non-fatal — continue without storage
        }

        // 3. Parse CV to JSON Resume via AI
        const jsonResume = await parseCvToJsonResume(rawText);

        // 4. Run health scan
        const healthScan = await runHealthScan(jsonResume);

        // 5. Deactivate any existing active CV
        await supabase
            .from('master_cvs')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true);

        // 6. Insert new master CV
        const { data: masterCv, error: insertError } = await supabase
            .from('master_cvs')
            .insert({
                user_id: user.id,
                original_filename: file.name,
                original_storage_path: storagePath,
                raw_text: rawText,
                json_resume: jsonResume,
                diagnostics: {
                    ats_readability: healthScan.ats_readability,
                    keyword_density: healthScan.keyword_density,
                    signal_noise: healthScan.signal_to_noise,
                    weaknesses: healthScan.weaknesses,
                    missing_sections: healthScan.missing_sections,
                    strengths: healthScan.strengths,
                    brutal_summary: healthScan.brutal_summary,
                },
                health_score: healthScan.overall_score,
                is_active: true,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 });
        }

        // 7. Log audit event
        await supabase.from('audit_events').insert({
            user_id: user.id,
            event_type: 'cv_uploaded',
            resource_type: 'master_cv',
            resource_id: masterCv.id,
            metadata: { filename: file.name, health_score: healthScan.overall_score },
        });

        await supabase.from('audit_events').insert({
            user_id: user.id,
            event_type: 'cv_parsed',
            resource_type: 'master_cv',
            resource_id: masterCv.id,
            metadata: { sections_found: Object.keys(jsonResume).length },
        });

        return NextResponse.json({
            id: masterCv.id,
            health_score: healthScan.overall_score,
            diagnostics: masterCv.diagnostics,
            json_resume: jsonResume,
        });
    } catch (error) {
        console.error('CV ingest error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

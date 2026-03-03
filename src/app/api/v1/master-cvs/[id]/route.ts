import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runHealthScan } from '@/lib/modules/cv-ingest/health-scan';
import { jsonResumeSchema } from '@/lib/modules/cv-ingest/schemas';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const supabase = await createClient();

        // 1. Verify user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse payload
        const body = await request.json();
        const { json_resume } = body;

        if (!json_resume) {
            return NextResponse.json({ error: 'Missing json_resume in body' }, { status: 400 });
        }

        // Validate structure basically to ensure it breaks nothing
        const validation = jsonResumeSchema.safeParse(json_resume);
        const validResume = validation.success ? validation.data : json_resume as any;

        // 3. Run health scan on updated resume
        const scanResult = await runHealthScan(validResume);

        // 4. Update database
        const { error: updateError } = await supabase
            .from('master_cvs')
            .update({
                json_resume: validResume,
                health_score: scanResult.overall_score,
                diagnostics: scanResult
            })
            .eq('id', resolvedParams.id)
            .eq('user_id', user.id);

        if (updateError) {
            console.error('Supabase CV update error:', updateError);
            throw updateError;
        }

        return NextResponse.json({ success: true, score: scanResult.overall_score });

    } catch (error) {
        console.error('Error updating master CV:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

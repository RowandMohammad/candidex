import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeJobDescription, hashJdText } from '@/lib/modules/job-intelligence/analyze';
import { stripHtmlToText } from '@/lib/modules/job-intelligence/sanitize';

/**
 * POST /api/v1/job-intelligence/analyze
 * 
 * Parse a job description and extract Job Intelligence.
 * Supports: jd_text (paste), jd_url (URL fetch), jd_pdf (file upload via formdata).
 * Caches by SHA256(jd_text).
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Parse body — support JSON or FormData
        let jdText = '';
        let jdUrl = '';
        let companyName = '';
        let roleTitle = '';
        let salaryBand = '';
        let notes = '';

        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            jdText = (formData.get('jd_text') as string) || '';
            jdUrl = (formData.get('jd_url') as string) || '';
            companyName = (formData.get('company_name') as string) || '';
            roleTitle = (formData.get('role_title') as string) || '';
            salaryBand = (formData.get('salary_band') as string) || '';
            notes = (formData.get('notes') as string) || '';

            // Handle PDF upload
            const pdfFile = formData.get('jd_pdf') as File | null;
            if (pdfFile && !jdText && !jdUrl) {
                const buffer = Buffer.from(await pdfFile.arrayBuffer());
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const pdfParse = require('pdf-parse/lib/pdf-parse.js');
                const parsed = await pdfParse(buffer);
                jdText = parsed.text;
            }
        } else {
            const body = await request.json();
            jdText = body.jd_text || '';
            jdUrl = body.jd_url || '';
            companyName = body.company_name || '';
            roleTitle = body.role_title || '';
            salaryBand = body.salary_band || '';
            notes = body.notes || '';
        }

        // If URL provided, fetch and strip HTML
        if (jdUrl && !jdText) {
            try {
                const res = await fetch(jdUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Candidex/1.0)',
                        'Accept': 'text/html,application/xhtml+xml',
                    },
                    signal: AbortSignal.timeout(10000),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const html = await res.text();
                jdText = stripHtmlToText(html);
            } catch (fetchErr) {
                return NextResponse.json(
                    { error: { code: 'VALIDATION_ERROR', message: `Failed to fetch URL: ${(fetchErr as Error).message}` } },
                    { status: 400 }
                );
            }
        }

        if (!jdText || jdText.trim().length < 50) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Job description text is required (minimum 50 characters)' } },
                { status: 400 }
            );
        }

        // Check generation cache
        const inputHash = hashJdText(jdText);
        const { data: cached } = await supabase
            .from('generation_cache')
            .select('output')
            .eq('input_hash', inputHash)
            .eq('cache_key', 'jd_intelligence')
            .eq('user_id', user.id)
            .single();

        let intelligence;

        if (cached) {
            intelligence = cached.output;
        } else {
            // Run AI analysis
            intelligence = await analyzeJobDescription(jdText, companyName, roleTitle);

            // Cache the result
            await supabase.from('generation_cache').insert({
                user_id: user.id,
                input_hash: inputHash,
                cache_key: 'jd_intelligence',
                output: intelligence,
                model_id: 'gemini-2.5-flash',
            });
        }

        // Use AI-extracted company/role if user didn't provide
        const finalCompany = companyName || intelligence.extracted_company_name || 'Unknown Company';
        const finalRole = roleTitle || intelligence.extracted_role_title || 'Unknown Role';

        // Get user's active master CV
        const { data: masterCv } = await supabase
            .from('master_cvs')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        // Create job_packs row
        const { data: jobPack, error: packErr } = await supabase
            .from('job_packs')
            .insert({
                user_id: user.id,
                company_name: finalCompany,
                role_title: finalRole,
                job_url: jdUrl || null,
                jd_raw_text: jdText,
                salary_band: salaryBand || null,
                notes: notes || '',
                status: 'interested',
                next_action: 'Review job intelligence and generate tailored CV',
                master_cv_id: masterCv?.id || null,
            })
            .select('id')
            .single();

        if (packErr || !jobPack) {
            console.error('Failed to create job pack:', packErr);
            return NextResponse.json(
                { error: { code: 'INTERNAL_ERROR', message: 'Failed to create job pack' } },
                { status: 500 }
            );
        }

        // Create job_intelligence row
        const { error: intelErr } = await supabase
            .from('job_intelligence')
            .insert({
                job_pack_id: jobPack.id,
                must_have_skills: intelligence.must_have_skills,
                nice_to_have_skills: intelligence.nice_to_have_skills,
                responsibilities: intelligence.responsibilities,
                ats_keywords: intelligence.ats_keywords,
                role_archetype: intelligence.role_archetype,
                seniority_estimate: intelligence.seniority_estimate,
                seniority_indicators: intelligence.seniority_indicators,
                inferred_focus: intelligence.inferred_focus,
                raw_extraction: intelligence,
                user_overrides: {},
            });

        if (intelErr) {
            console.error('Failed to create job intelligence:', intelErr);
            // Clean up orphan job pack
            await supabase.from('job_packs').delete().eq('id', jobPack.id);
            return NextResponse.json(
                { error: { code: 'INTERNAL_ERROR', message: 'Failed to store job intelligence' } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            job_pack_id: jobPack.id,
            job_intelligence: intelligence,
        }, { status: 201 });

    } catch (error) {
        console.error('Job intelligence analysis error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    }
}

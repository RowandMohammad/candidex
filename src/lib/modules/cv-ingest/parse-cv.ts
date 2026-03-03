import { generateObject } from 'ai';
import { getModel } from '@/lib/ai/model-router';
import { jsonResumeSchema, type ParsedJsonResume } from './schemas';

/**
 * Parse raw CV text into structured JSON Resume using AI.
 * Uses Gemini Flash for cost-effective extraction.
 */
export async function parseCvToJsonResume(rawText: string): Promise<ParsedJsonResume> {
    const today = new Date().toISOString().split('T')[0];
    const { object } = await generateObject({
        model: getModel('cv_extraction'),
        schema: jsonResumeSchema,
        system: `You are an expert CV/resume parser. Extract ALL information from the provided resume text into structured JSON Resume format.

IMPORTANT: Today's date is ${today}. Dates in 2024, 2025, and 2026 are valid and current — do NOT treat them as future dates.

RULES:
- Extract EVERY piece of information. Do not skip any section.
- For work experience, extract ALL bullet points as highlights.
- Preserve exact dates as written (e.g., "Jan 2020" → "2020-01")
- Preserve exact metrics and numbers (e.g., "increased by 40%")
- If a field is not present in the resume, omit it or use an empty value.
- For skills, group related technologies under descriptive category names.
- Extract LinkedIn, GitHub, and other profile URLs if present.
- Do NOT invent or embellish any information. Extract only what is written.`,
        prompt: `Parse the following resume text into JSON Resume format:\n\n${rawText}`,
    });

    return object;
}

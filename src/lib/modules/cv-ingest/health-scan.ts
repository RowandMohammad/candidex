import { generateObject } from 'ai';
import { getModel } from '@/lib/ai/model-router';
import { z } from 'zod';
import type { ParsedJsonResume } from './schemas';

const healthScanSchema = z.object({
    overall_score: z.number().min(0).max(100).describe('Overall CV health score 0-100'),
    ats_readability: z.number().min(0).max(100).describe('ATS readability score'),
    keyword_density: z.number().min(0).max(100).describe('Keyword density score'),
    signal_to_noise: z.number().min(0).max(100).describe('Signal to noise ratio score'),
    weaknesses: z.array(z.object({
        section: z.string(),
        issue: z.string(),
        severity: z.enum(['critical', 'warning', 'info']),
        suggestion: z.string(),
    })).describe('Identified weaknesses'),
    missing_sections: z.array(z.string()).describe('Sections that are missing from the CV'),
    strengths: z.array(z.string()).describe('Notable strengths'),
    brutal_summary: z.string().describe('A brutally honest 2-3 sentence summary of this CV\'s quality'),
});

export type HealthScanResult = z.infer<typeof healthScanSchema>;

/**
 * Run a health scan on a parsed JSON Resume.
 * Provides brutally honest feedback on CV quality.
 */
export async function runHealthScan(jsonResume: ParsedJsonResume): Promise<HealthScanResult> {
    const { object } = await generateObject({
        model: getModel('cv_health_scan'),
        schema: healthScanSchema,
        system: `You are a brutally honest CV quality auditor for tech/engineering roles. You tell the truth even when it hurts.

SCORING CRITERIA:
- ats_readability: Does it use standard formatting, clear section headers, no fancy layouts?
- keyword_density: Does it have relevant technical keywords for the person's apparent role?
- signal_to_noise: Does every bullet demonstrate impact, or is it padded with responsibilities?

WEAKNESS DETECTION:
- Flag vague bullets that describe responsibilities instead of achievements ("Worked on..." → critical)
- Flag missing quantification (no metrics, no numbers → warning)
- Flag gaps in experience (unexplained timeline gaps → warning)
- Flag missing sections (no skills section, no summary → warning)
- Flag very short or very long CVs (< 200 words or > 2000 words → info)

SEVERITY:
- critical: Will get the CV auto-rejected by ATS or screener
- warning: Weakens the application but isn't fatal
- info: Could be improved but is acceptable

BRUTAL SUMMARY:
- Be direct. No cheerleading. If the CV is mediocre, say so.
- Example: "This CV reads like a job description copy-paste. Zero quantified achievements across 3 roles. Any screener will skip this in 6 seconds."`,
        prompt: `Analyze this CV and provide a health scan:\n\n${JSON.stringify(jsonResume, null, 2)}`,
    });

    return object;
}

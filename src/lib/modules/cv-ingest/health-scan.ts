import { generateObject } from 'ai';
import { getModel } from '@/lib/ai/model-router';
import { z } from 'zod';
import type { ParsedJsonResume } from './schemas';
import { computeDeterministicScores } from './deterministic-scoring';

/**
 * Schema for LLM qualitative feedback only.
 * Numerical scores are computed deterministically — see deterministic-scoring.ts
 */
const qualitativeFeedbackSchema = z.object({
    weaknesses: z.array(z.object({
        section: z.string(),
        issue: z.string(),
        severity: z.enum(['critical', 'warning', 'info']),
        suggestion: z.string(),
    })).describe('Identified weaknesses'),
    strengths: z.array(z.string()).describe('Notable strengths'),
    brutal_summary: z.string().describe('A brutally honest 2-3 sentence summary of this CV\'s quality'),
});

export interface HealthScanResult {
    overall_score: number;
    ats_readability: number;
    keyword_density: number;
    signal_to_noise: number;
    weaknesses: Array<{
        section: string;
        issue: string;
        severity: 'critical' | 'warning' | 'info';
        suggestion: string;
    }>;
    missing_sections: string[];
    strengths: string[];
    brutal_summary: string;
}

/**
 * Run a health scan on a parsed JSON Resume.
 * 
 * SCORING: Deterministic, rule-based (same CV = same score, always).
 * FEEDBACK: LLM-powered qualitative analysis (weaknesses, strengths, summary).
 */
export async function runHealthScan(jsonResume: ParsedJsonResume): Promise<HealthScanResult> {
    // 1. Compute deterministic numerical scores
    const scores = computeDeterministicScores(jsonResume);

    // 2. Get qualitative feedback from LLM
    const today = new Date().toISOString().split('T')[0];
    const { object: feedback } = await generateObject({
        model: getModel('cv_health_scan'),
        schema: qualitativeFeedbackSchema,
        temperature: 0,
        system: `You are a brutally honest CV quality auditor for tech/engineering roles. You tell the truth even when it hurts.

IMPORTANT CONTEXT:
- Today's date is ${today}. Dates in 2024, 2025, and 2026 are NOT in the future — they are recent/current.
- This CV was parsed from a PDF/DOCX. Embedded hyperlinks (URLs behind clickable text/icons) are NOT captured by text extraction. If you see labels like "LinkedIn", "Github", or a domain name, treat them as evidence the link EXISTS. Do NOT flag them as missing.
- The numerical scores are already computed separately. Focus ONLY on qualitative feedback: specific weaknesses, strengths, and a summary.

WEAKNESS DETECTION:
- Flag vague bullets that describe responsibilities instead of achievements ("Worked on..." → critical)
- Flag missing quantification (no metrics, no numbers → warning)
- Flag unexplained timeline gaps → warning
- Flag missing critical sections (no skills, no summary → warning)

SEVERITY:
- critical: Will get the CV auto-rejected by ATS or screener
- warning: Weakens the application but isn't fatal
- info: Could be improved but is acceptable

BRUTAL SUMMARY:
- Be direct. No cheerleading. If the CV is mediocre, say so.
- Do NOT mention or estimate numerical scores — those are computed separately.`,
        prompt: `Provide qualitative feedback on this CV:\n\n${JSON.stringify(jsonResume, null, 2)}`,
    });

    // 3. Merge deterministic scores + LLM feedback
    // Apply penalties based on weaknesses so placeholder text / unprofessional content drops the score
    let { overall_score } = scores;
    const criticalCount = feedback.weaknesses.filter(w => w.severity === 'critical').length;
    const warningCount = feedback.weaknesses.filter(w => w.severity === 'warning').length;

    // Deduct 15 for critical, 5 for warning
    const penalty = (criticalCount * 15) + (warningCount * 5);
    overall_score = Math.max(0, overall_score - penalty);

    return {
        overall_score,
        ats_readability: scores.ats_readability,
        keyword_density: scores.keyword_density,
        signal_to_noise: scores.signal_to_noise,
        missing_sections: scores.missing_sections,
        weaknesses: feedback.weaknesses,
        strengths: feedback.strengths,
        brutal_summary: feedback.brutal_summary,
    };
}

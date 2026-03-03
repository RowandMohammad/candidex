import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

/**
 * AI Model Router for Candidex.
 * 
 * Routes tasks to the appropriate model based on complexity:
 * - Complex reasoning (tailoring, interview prep): Claude Sonnet 4.6
 * - Cheap extraction (parsing, classification): Gemini 3 Flash
 */

export const MODELS = {
    // Complex reasoning — higher quality, higher cost
    'cv_tailoring': anthropic('claude-sonnet-4-6-20250514'),
    'interview_prep': anthropic('claude-sonnet-4-6-20250514'),

    // Cheap extraction — fast, low cost
    'cv_extraction': google('gemini-2.5-flash'),
    'cv_health_scan': google('gemini-2.5-flash'),
    'jd_parsing': google('gemini-2.5-flash'),
    'outreach_gen': google('gemini-2.5-flash'),
    'post_interview_remediation': google('gemini-2.5-flash'),
} as const;

export type PipelineId = keyof typeof MODELS;

export function getModel(pipelineId: PipelineId) {
    const model = MODELS[pipelineId];
    if (!model) {
        throw new Error(`Unknown pipeline: ${pipelineId}`);
    }
    return model;
}

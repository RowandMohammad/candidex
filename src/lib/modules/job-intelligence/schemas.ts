import { z } from 'zod';

/**
 * Zod schema for Job Intelligence AI output.
 * Used with generateObject() to validate Gemini 2.5 Flash output.
 * Matches PROMPT_PIPELINES.md Pipeline 2 output spec.
 */
export const jobIntelligenceSchema = z.object({
    must_have_skills: z.array(z.object({
        skill: z.string(),
        rank: z.number().int().min(1),
        category: z.enum(['language', 'framework', 'tool', 'platform', 'concept', 'soft_skill', 'other']),
    })),
    nice_to_have_skills: z.array(z.object({
        skill: z.string(),
        rank: z.number().int().min(1),
        category: z.enum(['language', 'framework', 'tool', 'platform', 'concept', 'soft_skill', 'other']),
    })),
    responsibilities: z.array(z.object({
        text: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
    })),
    ats_keywords: z.array(z.string()),
    role_archetype: z.enum([
        'backend', 'frontend', 'fullstack', 'data_engineer', 'data_scientist',
        'ml_engineer', 'devops', 'platform', 'mobile', 'security', 'qa', 'other',
    ]),
    seniority_estimate: z.enum(['intern', 'junior', 'mid', 'senior', 'staff', 'principal', 'lead', 'manager']),
    seniority_indicators: z.array(z.string()),
    inferred_focus: z.string().max(300),
    extracted_company_name: z.string().optional(),
    extracted_role_title: z.string().optional(),
});

export type JobIntelligenceOutput = z.infer<typeof jobIntelligenceSchema>;

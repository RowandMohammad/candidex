import { describe, it, expect } from 'vitest';
import { jobIntelligenceSchema } from '@/lib/modules/job-intelligence/schemas';

describe('jobIntelligenceSchema', () => {
    it('validates a well-formed Job Intelligence output', () => {
        const validOutput = {
            must_have_skills: [
                { skill: 'TypeScript', rank: 1, category: 'language' },
                { skill: 'React', rank: 2, category: 'framework' },
            ],
            nice_to_have_skills: [
                { skill: 'GraphQL', rank: 1, category: 'tool' },
            ],
            responsibilities: [
                { text: 'Build scalable frontend', priority: 'high' },
                { text: 'Write documentation', priority: 'low' },
            ],
            ats_keywords: ['TypeScript', 'React', 'frontend', 'agile'],
            role_archetype: 'frontend',
            seniority_estimate: 'senior',
            seniority_indicators: ['5+ years', 'lead team'],
            inferred_focus: 'They need someone who can own frontend architecture and ship fast.',
            extracted_company_name: 'Acme Corp',
            extracted_role_title: 'Senior Frontend Engineer',
        };

        const result = jobIntelligenceSchema.safeParse(validOutput);
        expect(result.success).toBe(true);
    });

    it('rejects output with missing required fields', () => {
        const invalid = {
            must_have_skills: [],
            // Missing all other required fields
        };

        const result = jobIntelligenceSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    it('rejects invalid skill category', () => {
        const invalid = {
            must_have_skills: [
                { skill: 'TypeScript', rank: 1, category: 'invalid_category' },
            ],
            nice_to_have_skills: [],
            responsibilities: [],
            ats_keywords: [],
            role_archetype: 'frontend',
            seniority_estimate: 'senior',
            seniority_indicators: [],
            inferred_focus: 'Test focus',
        };

        const result = jobIntelligenceSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    it('rejects invalid role archetype', () => {
        const invalid = {
            must_have_skills: [],
            nice_to_have_skills: [],
            responsibilities: [],
            ats_keywords: [],
            role_archetype: 'wizard',
            seniority_estimate: 'senior',
            seniority_indicators: [],
            inferred_focus: 'Test',
        };

        const result = jobIntelligenceSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });

    it('allows optional extracted_company_name and extracted_role_title', () => {
        const validOutput = {
            must_have_skills: [],
            nice_to_have_skills: [],
            responsibilities: [],
            ats_keywords: [],
            role_archetype: 'backend',
            seniority_estimate: 'mid',
            seniority_indicators: [],
            inferred_focus: 'Backend developer focus.',
        };

        const result = jobIntelligenceSchema.safeParse(validOutput);
        expect(result.success).toBe(true);
    });
});

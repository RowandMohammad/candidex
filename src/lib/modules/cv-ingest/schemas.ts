import { z } from 'zod';

/**
 * Zod schema for AI-extracted JSON Resume output.
 * Used with generateObject() to ensure structured, validated output.
 */
export const jsonResumeSchema = z.object({
    basics: z.object({
        name: z.string().describe('Full name'),
        label: z.string().optional().describe('Professional title/label'),
        email: z.string().describe('Email address'),
        phone: z.string().optional().describe('Phone number'),
        url: z.string().optional().describe('Personal website or portfolio'),
        summary: z.string().optional().describe('Professional summary'),
        location: z.object({
            city: z.string().optional(),
            region: z.string().optional(),
            countryCode: z.string().optional(),
        }).optional(),
        profiles: z.array(z.object({
            network: z.string(),
            username: z.string().optional(),
            url: z.string().optional(),
        })).optional(),
    }),
    work: z.array(z.object({
        name: z.string().describe('Company name'),
        position: z.string().describe('Job title'),
        url: z.string().optional(),
        startDate: z.string().describe('Start date (YYYY-MM or YYYY-MM-DD)'),
        endDate: z.string().optional().describe('End date or empty if current'),
        summary: z.string().optional(),
        highlights: z.array(z.string()).describe('Key achievements and responsibilities as bullet points'),
    })),
    education: z.array(z.object({
        institution: z.string(),
        area: z.string().describe('Field of study'),
        studyType: z.string().describe('Degree type (BSc, MSc, PhD, etc.)'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        score: z.string().optional(),
        courses: z.array(z.string()).optional(),
    })),
    skills: z.array(z.object({
        name: z.string().describe('Skill category name'),
        level: z.string().optional(),
        keywords: z.array(z.string()).describe('Specific technologies/tools'),
    })),
    projects: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        highlights: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        url: z.string().optional(),
    })).optional(),
    certifications: z.array(z.object({
        name: z.string(),
        date: z.string().optional(),
        issuer: z.string().optional(),
        url: z.string().optional(),
    })).optional(),
    languages: z.array(z.object({
        language: z.string(),
        fluency: z.string().optional(),
    })).optional(),
    volunteer: z.array(z.object({
        organization: z.string(),
        position: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        summary: z.string().optional(),
        highlights: z.array(z.string()).optional(),
    })).optional(),
});

export type ParsedJsonResume = z.infer<typeof jsonResumeSchema>;

import type { ParsedJsonResume } from './schemas';

/**
 * Deterministic, rule-based CV health scoring.
 * Computes numerical scores from JSON Resume data using fixed rules.
 * Guarantees: same CV → same score, every time.
 */

interface ScoringResult {
    overall_score: number;
    ats_readability: number;
    keyword_density: number;
    signal_to_noise: number;
    missing_sections: string[];
}

export function computeDeterministicScores(jsonResume: ParsedJsonResume): ScoringResult {
    let ats = 100;
    let keywords = 100;
    let signalNoise = 100;
    const missing: string[] = [];

    // ── ATS Readability ──────────────────────────────────────
    // Checks: has basics, has work, has education, has skills, has summary
    const basics = jsonResume.basics;
    if (!basics?.name) { ats -= 15; }
    if (!basics?.email) { ats -= 10; }
    if (!basics?.summary || basics.summary.length < 30) {
        ats -= 15;
        missing.push('Summary/Objective');
    }
    if (!basics?.phone) { ats -= 5; }

    const work = jsonResume.work || [];
    if (work.length === 0) { ats -= 25; missing.push('Work Experience'); }

    const education = jsonResume.education || [];
    if (education.length === 0) { ats -= 10; missing.push('Education'); }

    const skills = jsonResume.skills || [];
    if (skills.length === 0) { ats -= 15; missing.push('Skills'); }

    // Check for consistent date formats
    const dateFormatIssues = work.filter(w =>
        (w.startDate && !/^\d{4}(-\d{2})?(-\d{2})?$/.test(w.startDate))
    ).length;
    if (dateFormatIssues > 0) { ats -= 5 * Math.min(dateFormatIssues, 3); }

    // ── Keyword Density ──────────────────────────────────────
    // Count total unique keywords across skills
    const totalKeywords = skills.reduce((sum, s) => sum + (s.keywords?.length || 0), 0);
    if (totalKeywords < 5) { keywords -= 30; }
    else if (totalKeywords < 10) { keywords -= 15; }
    else if (totalKeywords < 15) { keywords -= 5; }

    // Check for skill categories
    if (skills.length < 2) { keywords -= 10; }

    // Check if work highlights mention technical terms (simple heuristic)
    const allHighlights = work.flatMap(w => w.highlights || []).join(' ').toLowerCase();
    const techTerms = ['api', 'database', 'deploy', 'test', 'architect', 'design', 'build',
        'develop', 'implement', 'optimize', 'scale', 'automate', 'integrate', 'pipeline',
        'cloud', 'aws', 'docker', 'kubernetes', 'ci/cd', 'microservice', 'react', 'node',
        'python', 'java', 'typescript', 'sql', 'machine learning', 'data'];
    const techHits = techTerms.filter(t => allHighlights.includes(t)).length;
    if (techHits < 3) { keywords -= 15; }
    else if (techHits < 6) { keywords -= 5; }

    // ── Signal to Noise ──────────────────────────────────────
    // Measures: quantified achievements, action verbs, bullet quality
    const totalBullets = work.reduce((sum, w) => sum + (w.highlights?.length || 0), 0);

    if (totalBullets === 0) {
        signalNoise -= 40;
    } else {
        // Check for quantification (numbers, percentages, dollar amounts)
        const quantifiedBullets = work.flatMap(w => w.highlights || [])
            .filter(h => /\d+%|\$[\d,]+|\d+x|\d+\+|\d{2,}/.test(h)).length;
        const quantRate = quantifiedBullets / totalBullets;
        if (quantRate < 0.2) { signalNoise -= 25; }
        else if (quantRate < 0.4) { signalNoise -= 15; }
        else if (quantRate < 0.6) { signalNoise -= 5; }

        // Check for action verbs at start of bullets
        const actionVerbs = ['led', 'built', 'designed', 'developed', 'implemented', 'created',
            'managed', 'delivered', 'reduced', 'increased', 'improved', 'launched', 'architected',
            'optimized', 'resolved', 'engineered', 'deployed', 'automated', 'established',
            'collaborated', 'mentored', 'spearheaded', 'streamlined', 'migrated', 'leveraged',
            'applied', 'performed', 'cover', 'own', 'provided', 'turn'];
        const actionBullets = work.flatMap(w => w.highlights || [])
            .filter(h => actionVerbs.some(v => h.toLowerCase().startsWith(v))).length;
        const actionRate = actionBullets / totalBullets;
        if (actionRate < 0.3) { signalNoise -= 15; }
        else if (actionRate < 0.5) { signalNoise -= 5; }

        // Penalize very short bullets (< 50 chars = probably low signal)
        const shortBullets = work.flatMap(w => w.highlights || [])
            .filter(h => h.length < 50).length;
        if (shortBullets / totalBullets > 0.3) { signalNoise -= 10; }
    }

    // Average bullets per role
    if (work.length > 0) {
        const avgBullets = totalBullets / work.length;
        if (avgBullets < 2) { signalNoise -= 10; }
    }

    // ── Missing sections check ──────────────────────────────
    const projects = jsonResume.projects || [];
    const certs = jsonResume.certifications || [];
    const languages = jsonResume.languages || [];
    const volunteer = jsonResume.volunteer || [];

    if (certs.length === 0) { missing.push('Certifications'); }
    if (languages.length === 0) { missing.push('Spoken Languages'); }
    if (volunteer.length === 0) { missing.push('Volunteer Experience'); }

    // Profiles check
    const profiles = basics?.profiles || [];
    if (profiles.length === 0 && !basics?.url) {
        ats -= 5;
    }

    // Clamp all scores to 0-100
    ats = Math.max(0, Math.min(100, ats));
    keywords = Math.max(0, Math.min(100, keywords));
    signalNoise = Math.max(0, Math.min(100, signalNoise));

    // Overall: weighted average
    const overall = Math.round(ats * 0.3 + keywords * 0.3 + signalNoise * 0.4);

    return {
        overall_score: overall,
        ats_readability: ats,
        keyword_density: keywords,
        signal_to_noise: signalNoise,
        missing_sections: missing,
    };
}

/**
 * Truth Trace types — Provenance tracking for CV modifications.
 * 
 * Every rewritten bullet must have a TruthTraceEntry linking it back
 * to source content in the Master CV. This is a non-negotiable constraint.
 */

export type TransformationType =
    | 'rewrite'        // Rephrased same content
    | 'merge'          // Combined multiple sources
    | 'quantify'       // Added/emphasized existing metrics
    | 'keyword_inject' // Added ATS keyword from JD
    | 'reorder'        // Changed order, not content
    | 'new_bullet'     // New bullet (must have source_node_ids)
    | 'original';      // Unchanged from master

export interface TruthTraceEntry {
    /** The generated/rewritten bullet text */
    generated_bullet: string;

    /** JSON paths to source content in master CV (e.g., "work[0].highlights[1]") */
    source_node_ids: string[];

    /** JD requirement IDs this bullet targets (e.g., "must_have[2]") */
    target_requirement_ids: string[];

    /** Type of transformation applied */
    transformation_type: TransformationType;

    /** Human-readable justification for the change */
    justification: string;

    /** Risk flags for this bullet */
    risk_flags: RiskFlag[];

    /** Confidence score (0-1) that this bullet is grounded in source */
    confidence: number;
}

export type RiskFlag =
    | 'unverified_metric'   // Number exists in source but context differs
    | 'inflated_scope'      // Scope/impact may be overstated
    | 'fabricated_content'  // No source found — BLOCKS auto-accept
    | 'missing_source'      // Source node couldn't be resolved
    | 'context_shift';      // Bullet used in different context than original

export interface TruthTraceVerificationResult {
    valid: boolean;
    violations: TruthTraceViolation[];
}

export interface TruthTraceViolation {
    type: 'missing_source' | 'ungrounded_metric' | 'no_source' | 'low_confidence';
    bullet: string;
    details: string;
}

export interface BrutalFeedback {
    weakest_bullets: Array<{
        path: string;
        text: string;
        issue: string;
        severity: 'critical' | 'warning' | 'info';
    }>;
    missing_requirements: Array<{
        requirement: string;
        priority: 'must_have' | 'nice_to_have';
        suggestion: string;
    }>;
    risk_flags: Array<{
        path: string;
        text: string;
        flag: RiskFlag;
        explanation: string;
    }>;
    overall_score: number;
    summary: string;
}

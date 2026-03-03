/**
 * Prompt-injection sanitization for untrusted JD text.
 * Strips patterns that attempt to override system prompts.
 */

const INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions?/gi,
    /disregard\s+(all\s+)?previous/gi,
    /you\s+are\s+now/gi,
    /system\s+prompt/gi,
    /new\s+instructions?/gi,
    /forget\s+(everything|all)/gi,
    /override\s+(system|instructions?)/gi,
    /act\s+as\s+(if|a)/gi,
    /pretend\s+(you|to\s+be)/gi,
    /do\s+not\s+follow/gi,
    /instead\s+of\s+following/gi,
    /<\/?system>/gi,
    /<\/?instructions?>/gi,
];

/**
 * Strip prompt-injection patterns from JD text before sending to LLM.
 * Returns sanitized text.
 */
export function sanitizeJdText(text: string): string {
    let clean = text;
    for (const pattern of INJECTION_PATTERNS) {
        clean = clean.replace(pattern, '[REDACTED]');
    }
    return clean;
}

/**
 * Strip HTML to plain text for URL-fetched job descriptions.
 * Removes scripts, styles, nav, footer, and HTML tags while preserving readable content.
 */
export function stripHtmlToText(html: string): string {
    let text = html;

    // Remove script, style, nav, footer, header tags and content
    text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<nav[\s\S]*?<\/nav>/gi, '');
    text = text.replace(/<footer[\s\S]*?<\/footer>/gi, '');
    text = text.replace(/<header[\s\S]*?<\/header>/gi, '');
    text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

    // Convert common block elements to newlines
    text = text.replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<li[^>]*>/gi, '• ');

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Decode common HTML entities
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, ' ');

    // Collapse whitespace
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
}

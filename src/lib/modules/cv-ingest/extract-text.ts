import mammoth from 'mammoth';

/**
 * Extract plain text from uploaded file buffer.
 * Supports PDF, DOCX, and plain text files.
 */
export async function extractTextFromFile(
    buffer: Buffer,
    filename: string,
): Promise<string> {
    const ext = filename.toLowerCase().split('.').pop();

    switch (ext) {
        case 'pdf': {
            // pdf-parse v1.x — lightweight, no canvas dependency
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require('pdf-parse');
            const result = await pdfParse(buffer);
            return result.text.trim();
        }
        case 'docx':
        case 'doc': {
            const result = await mammoth.extractRawText({ buffer });
            return result.value.trim();
        }
        case 'txt': {
            return buffer.toString('utf-8').trim();
        }
        default:
            throw new Error(`Unsupported file type: .${ext}. Use PDF, DOCX, or TXT.`);
    }
}

import { createClient } from '@supabase/supabase-js';

/**
 * Admin client using service_role key.
 * 
 * ⚠️ RESTRICTED: Only use for:
 * - Delete-my-data cascade operations
 * - Schema migrations
 * 
 * NEVER import this in API route handlers, server components, or client code.
 * Always use the regular server client from ./server.ts instead.
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('Missing Supabase admin credentials');
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

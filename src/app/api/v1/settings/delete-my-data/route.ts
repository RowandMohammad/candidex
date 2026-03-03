import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create deletion request
        const { error: insertError } = await supabase
            .from('deletion_requests')
            .insert({
                user_id: user.id,
                status: 'pending',
                metadata: { requested_via: 'settings_page' },
            });

        if (insertError) {
            return NextResponse.json({ error: 'Failed to create deletion request' }, { status: 500 });
        }

        // Log audit event
        await supabase.from('audit_events').insert({
            user_id: user.id,
            event_type: 'data_deletion_requested',
            metadata: { requested_at: new Date().toISOString() },
        });

        // TODO: In production, this would trigger a background job using service_role
        // to cascade delete all user data. For MVP, the request is logged and tracked.

        return NextResponse.json({ message: 'Deletion request created' });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

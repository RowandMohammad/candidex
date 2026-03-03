import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/v1/job-packs/:id — Fetch single job pack + job intelligence.
 * PATCH /api/v1/job-packs/:id — Update status, notes, next_action, user_overrides.
 */

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Fetch pack (RLS enforces user_id)
        const { data: pack, error: packErr } = await supabase
            .from('job_packs')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (packErr || !pack) {
            return NextResponse.json(
                { error: { code: 'NOT_FOUND', message: 'Job pack not found' } },
                { status: 404 }
            );
        }

        // Fetch intelligence
        const { data: intelligence } = await supabase
            .from('job_intelligence')
            .select('*')
            .eq('job_pack_id', id)
            .single();

        return NextResponse.json({
            job_pack: pack,
            job_intelligence: intelligence || null,
        });

    } catch (error) {
        console.error('Get job pack error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Update job pack fields (only allowed fields)
        const packUpdate: Record<string, unknown> = {};
        if (body.status !== undefined) packUpdate.status = body.status;
        if (body.notes !== undefined) packUpdate.notes = body.notes;
        if (body.next_action !== undefined) packUpdate.next_action = body.next_action;

        if (Object.keys(packUpdate).length > 0) {
            const { error } = await supabase
                .from('job_packs')
                .update(packUpdate)
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) {
                console.error('Failed to update job pack:', error);
                throw error;
            }
        }

        // Update user_overrides on job_intelligence if provided
        if (body.user_overrides !== undefined) {
            const { error } = await supabase
                .from('job_intelligence')
                .update({ user_overrides: body.user_overrides })
                .eq('job_pack_id', id);

            if (error) {
                console.error('Failed to update overrides:', error);
                throw error;
            }
        }

        return NextResponse.json({
            job_pack_id: id,
            updated_at: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Update job pack error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    }
}

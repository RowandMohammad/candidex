import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/v1/job-packs
 * List all job packs for authenticated user.
 * Query params: ?status=applied&sort=updated_at&order=desc&limit=50&offset=0
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const sort = url.searchParams.get('sort') || 'updated_at';
        const order = url.searchParams.get('order') || 'desc';
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
        const offset = parseInt(url.searchParams.get('offset') || '0');

        let query = supabase
            .from('job_packs')
            .select('id, company_name, role_title, status, notes, salary_band, next_action, created_at, updated_at', { count: 'exact' })
            .eq('user_id', user.id);

        if (status) {
            query = query.eq('status', status);
        }

        query = query.order(sort as any, { ascending: order === 'asc' })
            .range(offset, offset + limit - 1);

        const { data: packs, error, count } = await query;

        if (error) {
            console.error('Failed to list job packs:', error);
            throw error;
        }

        return NextResponse.json({
            job_packs: packs || [],
            total: count || 0,
            limit,
            offset,
        });

    } catch (error) {
        console.error('List job packs error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    }
}

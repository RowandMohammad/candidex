import { createClient } from '@/lib/supabase/server';
import { CvPageClient } from './cv-page-client';

export default async function CvPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: masterCv } = await supabase
        .from('master_cvs')
        .select('id, json_resume, health_score, diagnostics, original_filename, updated_at')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .single();

    return <CvPageClient masterCv={masterCv} />;
}

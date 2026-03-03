import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('display_name, strictness')
        .eq('id', user.id)
        .single();

    return (
        <div className="flex h-screen bg-zinc-950">
            <AppSidebar
                user={{
                    email: user.email || '',
                    displayName: profile?.display_name || user.email || '',
                }}
            />
            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
        </div>
    );
}

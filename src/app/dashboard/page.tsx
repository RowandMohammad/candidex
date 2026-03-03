import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, Upload, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('users_profile')
        .select('display_name')
        .eq('id', user!.id)
        .single();

    const { data: masterCv } = await supabase
        .from('master_cvs')
        .select('id, health_score, original_filename, updated_at')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .single();

    const { count: jobPackCount } = await supabase
        .from('job_packs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Welcome, {profile?.display_name || 'there'} 👋
                </h1>
                <p className="mt-1 text-zinc-400">
                    Your AI-powered job search command center.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Master CV Card */}
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <FileText className="h-5 w-5" />
                            Master CV
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            {masterCv
                                ? `${masterCv.original_filename} — Score: ${masterCv.health_score ?? 'Pending'}/100`
                                : 'Upload your CV to get started'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/cv">
                            <Button variant={masterCv ? 'outline' : 'default'} className="w-full">
                                {masterCv ? (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View & Edit CV
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload CV
                                    </>
                                )}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Status Summary Card */}
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Briefcase className="h-5 w-5" />
                            Quick Stats
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Your application pipeline
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm text-zinc-400">
                            <p>CV Health: {masterCv?.health_score ? `${masterCv.health_score}/100` : '—'}</p>
                            <Link href="/dashboard/tracker" className="flex items-center gap-1 text-violet-400 hover:text-violet-300">
                                Job Packs: {jobPackCount ?? 0}
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Getting Started Card */}
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-white">🚀 Getting Started</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Follow these steps
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-2 text-sm text-zinc-400">
                            <li className={masterCv ? 'text-green-400 line-through' : ''}>
                                1. Upload your Master CV
                            </li>
                            <li className={jobPackCount && jobPackCount > 0 ? 'text-green-400 line-through' : ''}>
                                <Link href="/dashboard/tracker" className="hover:text-violet-300">
                                    2. Create a Job Pack
                                </Link>
                            </li>
                            <li className="text-zinc-500">3. Tailor & Apply (M3)</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

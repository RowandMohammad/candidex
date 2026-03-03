'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [strictness, setStrictness] = useState<string>('normal');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from('users_profile')
                .select('strictness')
                .eq('id', user.id)
                .single();
            if (data?.strictness) setStrictness(data.strictness);
        }
        loadProfile();
    }, [supabase]);

    async function handleSaveStrictness(value: string) {
        setSaving(true);
        setStrictness(value);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('users_profile')
            .update({ strictness: value })
            .eq('id', user.id);

        if (error) {
            toast.error('Failed to save setting');
        } else {
            toast.success(`Strictness set to ${value}`);
        }
        setSaving(false);
    }

    async function handleDeleteMyData() {
        if (!confirm('Are you sure? This will permanently delete ALL your data including CVs, job packs, and generated content. This cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch('/api/v1/settings/delete-my-data', {
                method: 'POST',
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);
            toast.success('Data deletion requested. You will be logged out.');

            // Sign out and redirect
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to delete data';
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    <SettingsIcon className="mr-2 inline h-7 w-7" />
                    Settings
                </h1>
                <p className="mt-1 text-zinc-400">Configure your Candidex experience</p>
            </div>

            {/* Strictness Mode */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Shield className="h-5 w-5" />
                        Feedback Strictness
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Controls how brutally honest the AI feedback is
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Strictness Mode</Label>
                        <Select value={strictness} onValueChange={handleSaveStrictness} disabled={saving}>
                            <SelectTrigger className="w-64 border-zinc-700 bg-zinc-800 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="normal">
                                    🟢 Normal — Constructive feedback
                                </SelectItem>
                                <SelectItem value="brutal">
                                    🔴 Brutal — No sugarcoating, maximum honesty
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-zinc-500">
                            {strictness === 'brutal'
                                ? 'Brutal mode: AI will be extremely direct about weaknesses. No cheerleading.'
                                : 'Normal mode: AI provides actionable feedback in a constructive tone.'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Separator className="bg-zinc-800" />

            {/* Danger Zone */}
            <Card className="border-red-900/50 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Irreversible actions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border border-red-900/50 p-4">
                        <div>
                            <p className="font-medium text-white">Delete all my data</p>
                            <p className="text-sm text-zinc-500">
                                Permanently removes your profile, CVs, job packs, and all generated content.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteMyData}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete My Data'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

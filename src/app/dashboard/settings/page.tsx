'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Trash2, Shield, User, Briefcase, MapPin, Link2, Save, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
    display_name: string;
    target_roles: string[];
    target_locations: string[];
    seniority: string;
    industries: string[];
    availability: string;
    constraints: { visa_required?: boolean; remote_only?: boolean };
    portfolio_urls: string[];
    strictness: string;
}

const DEFAULT_PROFILE: ProfileData = {
    display_name: '',
    target_roles: [],
    target_locations: [],
    seniority: '',
    industries: [],
    availability: '',
    constraints: { visa_required: false, remote_only: false },
    portfolio_urls: [],
    strictness: 'normal',
};

function TagInput({ tags, onChange, placeholder }: {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder: string;
}) {
    const [input, setInput] = useState('');

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            const val = input.trim().replace(/,$/, '');
            if (val && !tags.includes(val)) {
                onChange([...tags, val]);
            }
            setInput('');
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 bg-zinc-800 text-zinc-200 hover:bg-zinc-700">
                        {tag}
                        <button
                            onClick={() => onChange(tags.filter((_, j) => j !== i))}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-zinc-600"
                            type="button"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
            <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">Press Enter or comma to add</p>
        </div>
    );
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const supabase = createClient();

    const loadProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('users_profile')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data) {
            setProfile({
                display_name: data.display_name || '',
                target_roles: data.target_roles || [],
                target_locations: data.target_locations || [],
                seniority: data.seniority || '',
                industries: data.industries || [],
                availability: data.availability || '',
                constraints: data.constraints as ProfileData['constraints'] || { visa_required: false, remote_only: false },
                portfolio_urls: data.portfolio_urls || [],
                strictness: data.strictness || 'normal',
            });
        }
        setLoaded(true);
    }, [supabase]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    async function handleSaveProfile() {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('users_profile')
            .update({
                display_name: profile.display_name,
                target_roles: profile.target_roles,
                target_locations: profile.target_locations,
                seniority: profile.seniority || null,
                industries: profile.industries,
                availability: profile.availability || null,
                constraints: profile.constraints,
                portfolio_urls: profile.portfolio_urls,
                strictness: profile.strictness,
            })
            .eq('id', user.id);

        if (error) {
            toast.error('Failed to save profile');
        } else {
            toast.success('Profile saved');
        }
        setSaving(false);
    }

    function addPortfolioUrl() {
        if (newUrl.trim() && !profile.portfolio_urls.includes(newUrl.trim())) {
            setProfile(p => ({ ...p, portfolio_urls: [...p.portfolio_urls, newUrl.trim()] }));
            setNewUrl('');
        }
    }

    async function handleDeleteMyData() {
        if (!confirm('Are you sure? This will permanently delete ALL your data including CVs, job packs, and generated content. This cannot be undone.')) {
            return;
        }
        setDeleting(true);
        try {
            const res = await fetch('/api/v1/settings/delete-my-data', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Data deletion requested. You will be logged out.');
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to delete data';
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    }

    if (!loaded) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        <SettingsIcon className="mr-2 inline h-7 w-7" />
                        Settings
                    </h1>
                    <p className="mt-1 text-zinc-400">Configure your Candidex profile and preferences</p>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </Button>
            </div>

            {/* Profile Info */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <User className="h-5 w-5" />
                        Profile
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Your basic info — used in generated content
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Display Name</Label>
                            <Input
                                value={profile.display_name}
                                onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
                                placeholder="John Doe"
                                className="border-zinc-700 bg-zinc-800 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Seniority Level</Label>
                            <Select
                                value={profile.seniority}
                                onValueChange={v => setProfile(p => ({ ...p, seniority: v }))}
                            >
                                <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                                    <SelectValue placeholder="Select seniority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                                    <SelectItem value="mid">Mid (2-5 years)</SelectItem>
                                    <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                                    <SelectItem value="lead">Lead (8+ years)</SelectItem>
                                    <SelectItem value="staff">Staff / Principal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Availability</Label>
                        <Select
                            value={profile.availability || ''}
                            onValueChange={v => setProfile(p => ({ ...p, availability: v }))}
                        >
                            <SelectTrigger className="w-64 border-zinc-700 bg-zinc-800 text-white">
                                <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="2_weeks">2 weeks notice</SelectItem>
                                <SelectItem value="1_month">1 month notice</SelectItem>
                                <SelectItem value="3_months">3 months notice</SelectItem>
                                <SelectItem value="not_looking">Not actively looking</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Job Search Targets */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Briefcase className="h-5 w-5" />
                        Job Search Targets
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        These inform AI-generated content and tailoring decisions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Target Roles</Label>
                        <TagInput
                            tags={profile.target_roles}
                            onChange={roles => setProfile(p => ({ ...p, target_roles: roles }))}
                            placeholder="e.g. Backend Engineer, Data Analyst, Full-Stack Dev"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Target Industries</Label>
                        <TagInput
                            tags={profile.industries}
                            onChange={industries => setProfile(p => ({ ...p, industries }))}
                            placeholder="e.g. FinTech, Big Tech, Startups, Quant"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-zinc-300">
                            <MapPin className="h-4 w-4" />
                            Preferred Locations
                        </Label>
                        <TagInput
                            tags={profile.target_locations}
                            onChange={locs => setProfile(p => ({ ...p, target_locations: locs }))}
                            placeholder="e.g. London, New York, Remote"
                        />
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="space-y-3">
                        <Label className="text-zinc-300">Constraints</Label>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={profile.constraints.visa_required || false}
                                    onChange={e => setProfile(p => ({
                                        ...p,
                                        constraints: { ...p.constraints, visa_required: e.target.checked },
                                    }))}
                                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-emerald-500"
                                />
                                Requires visa sponsorship
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={profile.constraints.remote_only || false}
                                    onChange={e => setProfile(p => ({
                                        ...p,
                                        constraints: { ...p.constraints, remote_only: e.target.checked },
                                    }))}
                                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-emerald-500"
                                />
                                Remote only
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Portfolio URLs */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Link2 className="h-5 w-5" />
                        Portfolio &amp; Links
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Personal website, GitHub, LinkedIn, etc.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {profile.portfolio_urls.map((url, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input
                                value={url}
                                readOnly
                                className="border-zinc-700 bg-zinc-800 text-zinc-300"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setProfile(p => ({
                                    ...p,
                                    portfolio_urls: p.portfolio_urls.filter((_, j) => j !== i),
                                }))}
                                className="text-zinc-400 hover:text-red-400"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <Input
                            value={newUrl}
                            onChange={e => setNewUrl(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPortfolioUrl(); } }}
                            placeholder="https://github.com/yourname"
                            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                        />
                        <Button variant="outline" onClick={addPortfolioUrl} className="shrink-0">
                            <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
                        <Select
                            value={profile.strictness}
                            onValueChange={v => setProfile(p => ({ ...p, strictness: v }))}
                        >
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
                            {profile.strictness === 'brutal'
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

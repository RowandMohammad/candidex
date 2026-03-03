'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { JobIntelligenceTab } from '@/components/job-packs/job-intelligence-tab';

interface JobPackDetailProps {
    packId: string;
}

const STATUS_OPTIONS = [
    { value: 'interested', label: 'Interested' },
    { value: 'applied', label: 'Applied' },
    { value: 'recruiter_screen', label: 'Recruiter Screen' },
    { value: 'technical', label: 'Technical' },
    { value: 'final_round', label: 'Final Round' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'archived', label: 'Archived' },
];

const STATUS_COLORS: Record<string, string> = {
    interested: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    applied: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    recruiter_screen: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    technical: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    final_round: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    offer: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    archived: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

function formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function JobPackDetailClient({ packId }: JobPackDetailProps) {
    const router = useRouter();
    const [pack, setPack] = useState<Record<string, unknown> | null>(null);
    const [intelligence, setIntelligence] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/job-packs/${packId}`);
            if (!res.ok) {
                router.push('/dashboard/tracker');
                return;
            }
            const data = await res.json();
            setPack(data.job_pack);
            setIntelligence(data.job_intelligence);
        } catch {
            console.error('Failed to fetch job pack');
        } finally {
            setLoading(false);
        }
    }, [packId, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            await fetch(`/api/v1/job-packs/${packId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            setPack((prev) => prev ? { ...prev, status: newStatus } : prev);
        } catch {
            console.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (!pack) {
        return (
            <div className="py-16 text-center text-zinc-400">
                Job pack not found.
            </div>
        );
    }

    const status = pack.status as string;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard/tracker')}
                        className="text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {pack.role_title as string}
                        </h1>
                        <p className="text-zinc-400">
                            {pack.company_name as string}
                            {pack.salary_band
                                ? ` • ${pack.salary_band}`
                                : ''}
                        </p>
                    </div>
                </div>
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger
                        className={`w-[170px] border ${STATUS_COLORS[status] || 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}
                    >
                        <SelectValue>
                            <Badge
                                variant="outline"
                                className={STATUS_COLORS[status]}
                            >
                                {formatStatus(status)}
                            </Badge>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-zinc-800">
                        {STATUS_OPTIONS.map((s) => (
                            <SelectItem
                                key={s.value}
                                value={s.value}
                                className="text-zinc-300 focus:bg-zinc-700"
                            >
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="intelligence" className="w-full">
                <TabsList className="w-full bg-zinc-800">
                    <TabsTrigger
                        value="intelligence"
                        className="flex-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                    >
                        Intelligence
                    </TabsTrigger>
                    <TabsTrigger
                        value="cv"
                        className="flex-1 text-zinc-500"
                        disabled
                    >
                        CV Builder
                        <span className="ml-1.5 rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                            M3
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="outreach"
                        className="flex-1 text-zinc-500"
                        disabled
                    >
                        Outreach
                        <span className="ml-1.5 rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                            M3
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="prep"
                        className="flex-1 text-zinc-500"
                        disabled
                    >
                        Prep
                        <span className="ml-1.5 rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                            M4
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="logs"
                        className="flex-1 text-zinc-500"
                        disabled
                    >
                        Logs
                        <span className="ml-1.5 rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                            M4
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="intelligence" className="mt-6">
                    {intelligence ? (
                        <JobIntelligenceTab
                            packId={packId}
                            intelligence={intelligence}
                            onOverridesUpdated={fetchData}
                        />
                    ) : (
                        <div className="py-16 text-center text-zinc-400">
                            <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin" />
                            No intelligence data available.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

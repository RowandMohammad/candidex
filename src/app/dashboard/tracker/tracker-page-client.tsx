'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreateJobPackModal } from '@/components/job-packs/create-job-pack-modal';

interface JobPack {
    id: string;
    company_name: string;
    role_title: string;
    status: string;
    notes: string;
    salary_band: string | null;
    next_action: string | null;
    created_at: string;
    updated_at: string;
}

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
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

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function TrackerPageClient() {
    const router = useRouter();
    const [packs, setPacks] = useState<JobPack[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchPacks = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sort: 'updated_at',
                order: sortOrder,
                limit: '50',
            });
            if (statusFilter !== 'all') {
                params.set('status', statusFilter);
            }
            const res = await fetch(`/api/v1/job-packs?${params}`);
            const data = await res.json();
            setPacks(data.job_packs || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch job packs:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, sortOrder]);

    useEffect(() => {
        fetchPacks();
    }, [fetchPacks]);

    // Pipeline summary counts
    const statusCounts = packs.reduce(
        (acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const handleStatusUpdate = async (packId: string, newStatus: string) => {
        try {
            await fetch(`/api/v1/job-packs/${packId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchPacks();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Tracker</h1>
                    <p className="mt-1 text-zinc-400">
                        {total} job pack{total !== 1 ? 's' : ''} in your pipeline
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-violet-600 hover:bg-violet-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Job Pack
                </Button>
            </div>

            {/* Pipeline Summary */}
            {total > 0 && (
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.filter((s) => s.value !== 'all').map((s) => (
                        <button
                            key={s.value}
                            onClick={() =>
                                setStatusFilter(
                                    statusFilter === s.value ? 'all' : s.value
                                )
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === s.value
                                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                                    : STATUS_COLORS[s.value] || 'border-zinc-700 bg-zinc-800 text-zinc-400'
                                }`}
                        >
                            {s.label}{' '}
                            <span className="ml-1 font-bold">
                                {statusCounts[s.value] || 0}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] border-zinc-700 bg-zinc-800 text-zinc-300">
                            <SelectValue />
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
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))
                    }
                    className="text-zinc-400 hover:text-zinc-200"
                >
                    <ArrowUpDown className="mr-1 h-4 w-4" />
                    {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
                </Button>
            </div>

            {/* Job Pack List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </div>
            ) : packs.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="flex flex-col items-center py-16 text-center">
                        <Briefcase className="mb-4 h-12 w-12 text-zinc-600" />
                        <h2 className="mb-2 text-xl font-semibold text-white">
                            No job packs yet
                        </h2>
                        <p className="mb-6 max-w-md text-sm text-zinc-400">
                            Create your first Job Pack by pasting a job
                            description or URL. Our AI will extract key
                            intelligence to help you tailor your application.
                        </p>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Job Pack
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {packs.map((pack) => (
                        <Card
                            key={pack.id}
                            className="cursor-pointer border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700 hover:bg-zinc-800/80"
                            onClick={() =>
                                router.push(`/dashboard/tracker/${pack.id}`)
                            }
                        >
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="truncate text-sm font-semibold text-white">
                                            {pack.role_title}
                                        </h3>
                                        <span className="text-sm text-zinc-500">
                                            —
                                        </span>
                                        <span className="truncate text-sm text-zinc-400">
                                            {pack.company_name}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                                        <span>
                                            Created {formatDate(pack.created_at)}
                                        </span>
                                        {pack.salary_band && (
                                            <span>• {pack.salary_band}</span>
                                        )}
                                        {pack.next_action && (
                                            <span className="text-zinc-400">
                                                • Next: {pack.next_action}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="ml-4 flex-shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Select
                                        value={pack.status}
                                        onValueChange={(v) =>
                                            handleStatusUpdate(pack.id, v)
                                        }
                                    >
                                        <SelectTrigger
                                            className={`w-[150px] border ${STATUS_COLORS[pack.status] || 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}
                                        >
                                            <SelectValue>
                                                <Badge
                                                    variant="outline"
                                                    className={STATUS_COLORS[pack.status]}
                                                >
                                                    {formatStatus(pack.status)}
                                                </Badge>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="border-zinc-700 bg-zinc-800">
                                            {STATUS_OPTIONS.filter(
                                                (s) => s.value !== 'all'
                                            ).map((s) => (
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <CreateJobPackModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={(packId) => {
                    setShowCreateModal(false);
                    fetchPacks();
                    router.push(`/dashboard/tracker/${packId}`);
                }}
            />
        </div>
    );
}

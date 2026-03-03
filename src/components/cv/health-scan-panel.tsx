'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react';

interface Diagnostics {
    ats_readability: number;
    keyword_density: number;
    signal_noise: number;
    weaknesses: Array<{
        section: string;
        issue: string;
        severity: 'critical' | 'warning' | 'info';
        suggestion: string;
    }>;
    missing_sections: string[];
    strengths: string[];
    brutal_summary: string;
}

interface HealthScanPanelProps {
    healthScore: number;
    diagnostics: Diagnostics;
}

function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
}

function getSeverityIcon(severity: string) {
    switch (severity) {
        case 'critical': return <AlertTriangle className="h-4 w-4 text-red-400" />;
        case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
        default: return <Info className="h-4 w-4 text-blue-400" />;
    }
}

function getSeverityBadge(severity: string) {
    switch (severity) {
        case 'critical': return <Badge variant="destructive">Critical</Badge>;
        case 'warning': return <Badge className="bg-yellow-600">Warning</Badge>;
        default: return <Badge variant="secondary">Info</Badge>;
    }
}

export function HealthScanPanel({ healthScore, diagnostics }: HealthScanPanelProps) {
    return (
        <div className="space-y-4">
            {/* Overall Score */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Shield className="h-5 w-5" />
                        CV Health Score
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <span className={`text-5xl font-bold ${getScoreColor(healthScore)}`}>
                            {healthScore}
                        </span>
                        <span className="text-2xl text-zinc-500">/100</span>
                    </div>
                    <p className="mt-3 text-sm italic text-zinc-400">
                        {diagnostics.brutal_summary}
                    </p>
                </CardContent>
            </Card>

            {/* Sub-scores */}
            <div className="grid gap-3 md:grid-cols-3">
                {[
                    { label: 'ATS Readability', score: diagnostics.ats_readability },
                    { label: 'Keyword Density', score: diagnostics.keyword_density },
                    { label: 'Signal / Noise', score: diagnostics.signal_noise },
                ].map(({ label, score }) => (
                    <Card key={label} className="border-zinc-800 bg-zinc-900">
                        <CardContent className="pt-4">
                            <p className="text-xs text-zinc-500">{label}</p>
                            <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Strengths */}
            {diagnostics.strengths.length > 0 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1 text-sm text-zinc-300">
                            {diagnostics.strengths.map((s, i) => (
                                <li key={i}>✅ {s}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Weaknesses */}
            {diagnostics.weaknesses.length > 0 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm text-yellow-400">
                            <AlertTriangle className="h-4 w-4" />
                            Issues Found ({diagnostics.weaknesses.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {diagnostics.weaknesses.map((w, i) => (
                                <div key={i} className="rounded-lg border border-zinc-800 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getSeverityIcon(w.severity)}
                                        <span className="text-sm font-medium text-zinc-300">{w.section}</span>
                                        {getSeverityBadge(w.severity)}
                                    </div>
                                    <p className="text-sm text-zinc-400">{w.issue}</p>
                                    <p className="mt-1 text-xs text-blue-400">💡 {w.suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Missing Sections */}
            {diagnostics.missing_sections.length > 0 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="pt-4">
                        <p className="mb-2 text-xs font-medium text-zinc-500">Missing Sections</p>
                        <div className="flex flex-wrap gap-2">
                            {diagnostics.missing_sections.map((s) => (
                                <Badge key={s} variant="outline" className="text-zinc-400">
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

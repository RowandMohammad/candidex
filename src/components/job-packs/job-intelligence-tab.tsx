'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Target,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Zap,
    Tag,
} from 'lucide-react';

interface Skill {
    skill: string;
    rank: number;
    category: string;
}

interface Responsibility {
    text: string;
    priority: 'high' | 'medium' | 'low';
}

interface JobIntelligenceTabProps {
    packId: string;
    intelligence: Record<string, unknown>;
    onOverridesUpdated: () => void;
}

type OverrideValue = 'critical' | 'irrelevant' | 'covered';

const CATEGORY_COLORS: Record<string, string> = {
    language: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    framework: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    tool: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    platform: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    concept: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    soft_skill: 'bg-green-500/20 text-green-400 border-green-500/30',
    other: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const PRIORITY_COLORS: Record<string, string> = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-green-400',
};

const PRIORITY_BADGES: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function JobIntelligenceTab({
    packId,
    intelligence,
    onOverridesUpdated,
}: JobIntelligenceTabProps) {
    const mustHave = (intelligence.must_have_skills as Skill[]) || [];
    const niceToHave = (intelligence.nice_to_have_skills as Skill[]) || [];
    const responsibilities =
        (intelligence.responsibilities as Responsibility[]) || [];
    const atsKeywords = (intelligence.ats_keywords as string[]) || [];
    const roleArchetype = (intelligence.role_archetype as string) || '';
    const seniorityEstimate =
        (intelligence.seniority_estimate as string) || '';
    const seniorityIndicators =
        (intelligence.seniority_indicators as string[]) || [];
    const inferredFocus = (intelligence.inferred_focus as string) || '';
    const existingOverrides =
        (intelligence.user_overrides as Record<string, OverrideValue>) || {};

    const [overrides, setOverrides] =
        useState<Record<string, OverrideValue>>(existingOverrides);
    const [savingOverrides, setSavingOverrides] = useState(false);

    const handleOverride = async (
        skill: string,
        value: OverrideValue
    ) => {
        const newOverrides = { ...overrides };

        // Toggle: if same value clicked, remove override
        if (newOverrides[skill] === value) {
            delete newOverrides[skill];
        } else {
            newOverrides[skill] = value;
        }

        setOverrides(newOverrides);
        setSavingOverrides(true);

        try {
            await fetch(`/api/v1/job-packs/${packId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_overrides: newOverrides,
                }),
            });
            onOverridesUpdated();
        } catch {
            console.error('Failed to save overrides');
        } finally {
            setSavingOverrides(false);
        }
    };

    const OverrideButtons = ({ skill }: { skill: string }) => (
        <div className="flex gap-1">
            <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-[10px] ${overrides[skill] === 'critical'
                        ? 'bg-red-500/20 text-red-400'
                        : 'text-zinc-500 hover:text-red-400'
                    }`}
                onClick={() => handleOverride(skill, 'critical')}
                disabled={savingOverrides}
            >
                Critical
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-[10px] ${overrides[skill] === 'irrelevant'
                        ? 'bg-zinc-500/20 text-zinc-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                onClick={() => handleOverride(skill, 'irrelevant')}
                disabled={savingOverrides}
            >
                Irrelevant
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-[10px] ${overrides[skill] === 'covered'
                        ? 'bg-green-500/20 text-green-400'
                        : 'text-zinc-500 hover:text-green-400'
                    }`}
                onClick={() => handleOverride(skill, 'covered')}
                disabled={savingOverrides}
            >
                Covered
            </Button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* What they actually care about */}
            <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-zinc-900">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <Target className="h-5 w-5 text-violet-400" />
                        What they actually care about
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed text-zinc-300">
                        {inferredFocus}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-400 border-blue-500/30"
                        >
                            {roleArchetype.replace(/_/g, ' ')}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-400 border-amber-500/30"
                        >
                            {seniorityEstimate}
                        </Badge>
                        {seniorityIndicators.map((ind, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="bg-zinc-800 text-zinc-400 border-zinc-700"
                            >
                                {ind}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Must-have skills */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base text-white">
                        <span className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-red-400" />
                            Must-Have Skills
                        </span>
                        <span className="text-xs text-zinc-500">
                            {mustHave.length} skills
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {mustHave.map((skill, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 text-center text-xs font-bold text-zinc-500">
                                        {skill.rank}
                                    </span>
                                    <span className="text-sm font-medium text-white">
                                        {skill.skill}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] ${CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.other}`}
                                    >
                                        {skill.category.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    {overrides[skill.skill] === 'covered' ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                    ) : overrides[skill.skill] ===
                                        'irrelevant' ? (
                                        <XCircle className="h-4 w-4 text-zinc-500" />
                                    ) : overrides[skill.skill] ===
                                        'critical' ? (
                                        <AlertTriangle className="h-4 w-4 text-red-400" />
                                    ) : null}
                                    <OverrideButtons skill={skill.skill} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Nice-to-have skills */}
            {niceToHave.length > 0 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-base text-white">
                            <span className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-400" />
                                Nice-to-Have Skills
                            </span>
                            <span className="text-xs text-zinc-500">
                                {niceToHave.length} skills
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {niceToHave.map((skill, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 text-center text-xs font-bold text-zinc-500">
                                            {skill.rank}
                                        </span>
                                        <span className="text-sm font-medium text-white">
                                            {skill.skill}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] ${CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.other}`}
                                        >
                                            {skill.category.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                    <OverrideButtons skill={skill.skill} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Separator className="bg-zinc-800" />

            {/* Responsibilities */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white">
                        Key Responsibilities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {responsibilities.map((resp, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2"
                            >
                                <Badge
                                    variant="outline"
                                    className={`mt-0.5 shrink-0 text-[10px] uppercase ${PRIORITY_BADGES[resp.priority] || PRIORITY_BADGES.medium}`}
                                >
                                    {resp.priority}
                                </Badge>
                                <span
                                    className={`text-sm ${PRIORITY_COLORS[resp.priority] || 'text-zinc-300'}`}
                                >
                                    {resp.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ATS Keywords */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                        <Tag className="h-4 w-4 text-violet-400" />
                        ATS Keywords
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {atsKeywords.map((keyword, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="border-violet-500/30 bg-violet-500/10 text-violet-300"
                            >
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

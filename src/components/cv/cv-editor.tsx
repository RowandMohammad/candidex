'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Briefcase, GraduationCap, Code, FolderOpen, Award } from 'lucide-react';
import { toast } from 'sonner';

interface CvEditorProps {
    cvId: string;
    initialData: Record<string, unknown>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function CvEditor({ cvId, initialData }: CvEditorProps) {
    const [data, setData] = useState<any>(initialData);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    async function handleSave() {
        setSaving(true);
        const { error } = await supabase
            .from('master_cvs')
            .update({ json_resume: data })
            .eq('id', cvId);

        if (error) {
            toast.error('Failed to save changes');
        } else {
            toast.success('CV saved');
        }
        setSaving(false);
    }

    function updateBasics(field: string, value: string) {
        setData((prev: any) => ({
            ...prev,
            basics: { ...prev.basics, [field]: value },
        }));
    }

    function updateWork(index: number, field: string, value: string) {
        setData((prev: any) => {
            const work = [...prev.work];
            work[index] = { ...work[index], [field]: value };
            return { ...prev, work };
        });
    }

    function updateWorkHighlight(workIndex: number, highlightIndex: number, value: string) {
        setData((prev: any) => {
            const work = [...prev.work];
            const highlights = [...(work[workIndex].highlights || [])];
            highlights[highlightIndex] = value;
            work[workIndex] = { ...work[workIndex], highlights };
            return { ...prev, work };
        });
    }

    function updateEducation(index: number, field: string, value: string) {
        setData((prev: any) => {
            const education = [...prev.education];
            education[index] = { ...education[index], [field]: value };
            return { ...prev, education };
        });
    }

    function updateSkill(index: number, field: string, value: string) {
        setData((prev: any) => {
            const skills = [...prev.skills];
            if (field === 'keywords') {
                skills[index] = { ...skills[index], keywords: value.split(',').map((k: string) => k.trim()) };
            } else {
                skills[index] = { ...skills[index], [field]: value };
            }
            return { ...prev, skills };
        });
    }

    return (
        <div className="space-y-4">
            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Basics */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-white">📋 Personal Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <label className="text-xs text-zinc-500">Name</label>
                            <Input
                                value={data.basics?.name || ''}
                                onChange={(e) => updateBasics('name', e.target.value)}
                                className="border-zinc-700 bg-zinc-800 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500">Title</label>
                            <Input
                                value={data.basics?.label || ''}
                                onChange={(e) => updateBasics('label', e.target.value)}
                                className="border-zinc-700 bg-zinc-800 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500">Email</label>
                            <Input
                                value={data.basics?.email || ''}
                                onChange={(e) => updateBasics('email', e.target.value)}
                                className="border-zinc-700 bg-zinc-800 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500">Phone</label>
                            <Input
                                value={data.basics?.phone || ''}
                                onChange={(e) => updateBasics('phone', e.target.value)}
                                className="border-zinc-700 bg-zinc-800 text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500">Summary</label>
                        <Textarea
                            value={data.basics?.summary || ''}
                            onChange={(e) => updateBasics('summary', e.target.value)}
                            rows={3}
                            className="border-zinc-700 bg-zinc-800 text-white"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Work Experience */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Briefcase className="h-5 w-5" />
                        Work Experience ({data.work?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.work?.map((job: any, i: number) => (
                        <div key={i} className="rounded-lg border border-zinc-800 p-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className="text-xs text-zinc-500">Company</label>
                                    <Input
                                        value={job.name || ''}
                                        onChange={(e) => updateWork(i, 'name', e.target.value)}
                                        className="border-zinc-700 bg-zinc-800 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Position</label>
                                    <Input
                                        value={job.position || ''}
                                        onChange={(e) => updateWork(i, 'position', e.target.value)}
                                        className="border-zinc-700 bg-zinc-800 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Start Date</label>
                                    <Input
                                        value={job.startDate || ''}
                                        onChange={(e) => updateWork(i, 'startDate', e.target.value)}
                                        className="border-zinc-700 bg-zinc-800 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">End Date</label>
                                    <Input
                                        value={job.endDate || ''}
                                        onChange={(e) => updateWork(i, 'endDate', e.target.value)}
                                        placeholder="Present"
                                        className="border-zinc-700 bg-zinc-800 text-white"
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="text-xs text-zinc-500">
                                    Highlights ({job.highlights?.length || 0} bullets)
                                </label>
                                {job.highlights?.map((h: string, j: number) => (
                                    <div key={j} className="mt-1 flex items-start gap-2">
                                        <span className="mt-2 text-xs text-zinc-600">{j + 1}.</span>
                                        <Textarea
                                            value={h}
                                            onChange={(e) => updateWorkHighlight(i, j, e.target.value)}
                                            rows={2}
                                            className="border-zinc-700 bg-zinc-800 text-sm text-white"
                                        />
                                    </div>
                                ))}
                            </div>
                            {i < data.work.length - 1 && <Separator className="mt-4 bg-zinc-800" />}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Education */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <GraduationCap className="h-5 w-5" />
                        Education ({data.education?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.education?.map((edu: any, i: number) => (
                        <div key={i} className="rounded-lg border border-zinc-800 p-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className="text-xs text-zinc-500">Institution</label>
                                    <Input
                                        value={edu.institution || ''}
                                        onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                                        className="border-zinc-700 bg-zinc-800 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Degree</label>
                                    <Input
                                        value={edu.studyType || ''}
                                        onChange={(e) => updateEducation(i, 'studyType', e.target.value)}
                                        className="border-zinc-700 bg-zinc-800 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Field of Study</label>
                                    <Input
                                        value={edu.area || ''}
                                        onChange={(e) => updateEducation(i, 'area', e.target.value)}
                                        className="border-zinc-700 bg-zinc-800 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">End Date</label>
                                    <Input
                                        value={edu.endDate || ''}
                                        onChange={(e) => updateEducation(i, 'endDate', e.target.value)}
                                        className="border-zinc-700 bg-zinc-800 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Code className="h-5 w-5" />
                        Skills ({data.skills?.length || 0} categories)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.skills?.map((skill: any, i: number) => (
                        <div key={i} className="rounded-lg border border-zinc-800 p-3">
                            <div className="mb-2">
                                <label className="text-xs text-zinc-500">Category</label>
                                <Input
                                    value={skill.name || ''}
                                    onChange={(e) => updateSkill(i, 'name', e.target.value)}
                                    className="border-zinc-700 bg-zinc-800 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500">Keywords (comma-separated)</label>
                                <Input
                                    value={skill.keywords?.join(', ') || ''}
                                    onChange={(e) => updateSkill(i, 'keywords', e.target.value)}
                                    className="border-zinc-700 bg-zinc-800 text-white"
                                />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {skill.keywords?.map((kw: string, j: number) => (
                                    <Badge key={j} variant="secondary" className="text-xs">
                                        {kw}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <FolderOpen className="h-5 w-5" />
                            Projects ({data.projects.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.projects.map((proj: any, i: number) => (
                            <div key={i} className="mb-3 rounded-lg border border-zinc-800 p-3">
                                <p className="font-medium text-white">{proj.name}</p>
                                <p className="text-sm text-zinc-400">{proj.description}</p>
                                {proj.keywords && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {proj.keywords.map((k: string, j: number) => (
                                            <Badge key={j} variant="outline" className="text-xs">{k}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Award className="h-5 w-5" />
                            Certifications ({data.certifications.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.certifications.map((cert: any, i: number) => (
                            <div key={i} className="mb-2 text-sm text-zinc-300">
                                <p className="font-medium">{cert.name}</p>
                                <p className="text-zinc-500">{cert.issuer} {cert.date ? `— ${cert.date}` : ''}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Bottom Save */}
            <div className="flex justify-end pb-8">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </Button>
            </div>
        </div>
    );
}

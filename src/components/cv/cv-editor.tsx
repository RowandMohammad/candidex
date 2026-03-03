'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Save, Briefcase, GraduationCap, Code, FolderOpen, Award,
    Plus, Trash2, Eye, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

interface CvEditorProps {
    cvId: string;
    initialData: Record<string, unknown>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function CvEditor({ cvId, initialData }: CvEditorProps) {
    const [data, setData] = useState<any>(initialData);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const savedRef = useRef<string>(JSON.stringify(initialData));
    const router = useRouter();

    // Track dirty state
    const markDirty = useCallback(() => setDirty(true), []);

    // Check if data matches saved state
    useEffect(() => {
        const current = JSON.stringify(data);
        setDirty(current !== savedRef.current);
    }, [data]);

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch(`/api/v1/master-cvs/${cvId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ json_resume: data }),
            });

            if (!res.ok) throw new Error('Failed to save');

            const result = await res.json();

            toast.success(`CV saved. New Score: ${result.score}/100`);
            savedRef.current = JSON.stringify(data);
            setDirty(false);

            // Refresh parent page to get updated score and diagnostics from server
            router.refresh();
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    }

    // ── Update helpers ──────────────────────────────────────

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

    function addWorkHighlight(workIndex: number) {
        setData((prev: any) => {
            const work = [...prev.work];
            const highlights = [...(work[workIndex].highlights || []), ''];
            work[workIndex] = { ...work[workIndex], highlights };
            return { ...prev, work };
        });
    }

    function removeWorkHighlight(workIndex: number, highlightIndex: number) {
        setData((prev: any) => {
            const work = [...prev.work];
            const highlights = [...(work[workIndex].highlights || [])];
            highlights.splice(highlightIndex, 1);
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

    function updateProject(index: number, field: string, value: string) {
        setData((prev: any) => {
            const projects = [...(prev.projects || [])];
            if (field === 'keywords') {
                projects[index] = { ...projects[index], keywords: value.split(',').map((k: string) => k.trim()) };
            } else if (field === 'highlights') {
                projects[index] = { ...projects[index], highlights: value.split('\n').filter((l: string) => l.trim()) };
            } else {
                projects[index] = { ...projects[index], [field]: value };
            }
            return { ...prev, projects };
        });
    }

    function addProject() {
        setData((prev: any) => ({
            ...prev,
            projects: [...(prev.projects || []), { name: '', description: '', keywords: [], highlights: [] }],
        }));
    }

    function removeProject(index: number) {
        setData((prev: any) => ({
            ...prev,
            projects: (prev.projects || []).filter((_: any, i: number) => i !== index),
        }));
    }

    function updateCertification(index: number, field: string, value: string) {
        setData((prev: any) => {
            const certs = [...(prev.certifications || [])];
            certs[index] = { ...certs[index], [field]: value };
            return { ...prev, certifications: certs };
        });
    }

    function addCertification() {
        setData((prev: any) => ({
            ...prev,
            certifications: [...(prev.certifications || []), { name: '', issuer: '', date: '' }],
        }));
    }

    function removeCertification(index: number) {
        setData((prev: any) => ({
            ...prev,
            certifications: (prev.certifications || []).filter((_: any, i: number) => i !== index),
        }));
    }

    // ── Render ───────────────────────────────────────────────

    const isEditing = mode === 'edit';

    return (
        <div className="space-y-4">
            {/* Top toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/95 p-3 backdrop-blur">
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg bg-zinc-800 p-0.5">
                        <button
                            onClick={() => setMode('edit')}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${isEditing ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </button>
                        <button
                            onClick={() => setMode('preview')}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${!isEditing ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                        </button>
                    </div>
                    {dirty && (
                        <Badge variant="outline" className="border-amber-600/50 text-amber-400">
                            Unsaved changes
                        </Badge>
                    )}
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    className={dirty
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-zinc-700 text-zinc-400'
                    }
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : dirty ? 'Save Changes' : 'Saved ✓'}
                </Button>
            </div>

            {/* Basics */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-white">📋 Personal Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isEditing ? (
                        <>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className="text-xs text-zinc-500">Name</label>
                                    <Input value={data.basics?.name || ''} onChange={e => updateBasics('name', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Title</label>
                                    <Input value={data.basics?.label || ''} onChange={e => updateBasics('label', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Email</label>
                                    <Input value={data.basics?.email || ''} onChange={e => updateBasics('email', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Phone</label>
                                    <Input value={data.basics?.phone || ''} onChange={e => updateBasics('phone', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500">Summary</label>
                                <Textarea value={data.basics?.summary || ''} onChange={e => updateBasics('summary', e.target.value)} rows={3} className="border-zinc-700 bg-zinc-800 text-white" />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">{data.basics?.name || 'No name'}</h3>
                            {data.basics?.label && <p className="text-sm text-zinc-300">{data.basics.label}</p>}
                            <p className="text-sm text-zinc-400">{data.basics?.email} {data.basics?.phone && `• ${data.basics.phone}`}</p>
                            {data.basics?.summary && <p className="mt-2 text-sm leading-relaxed text-zinc-300">{data.basics.summary}</p>}
                        </div>
                    )}
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
                            {isEditing ? (
                                <>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div>
                                            <label className="text-xs text-zinc-500">Company</label>
                                            <Input value={job.name || ''} onChange={e => updateWork(i, 'name', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500">Position</label>
                                            <Input value={job.position || ''} onChange={e => updateWork(i, 'position', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500">Start Date</label>
                                            <Input value={job.startDate || ''} onChange={e => updateWork(i, 'startDate', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500">End Date</label>
                                            <Input value={job.endDate || ''} onChange={e => updateWork(i, 'endDate', e.target.value)} placeholder="Present" className="border-zinc-700 bg-zinc-800 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs text-zinc-500">
                                                Highlights ({job.highlights?.length || 0} bullets)
                                            </label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addWorkHighlight(i)}
                                                className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
                                            >
                                                <Plus className="mr-1 h-3 w-3" /> Add bullet
                                            </Button>
                                        </div>
                                        {job.highlights?.map((h: string, j: number) => (
                                            <div key={j} className="mt-1 flex items-start gap-2">
                                                <span className="mt-2 text-xs text-zinc-600">{j + 1}.</span>
                                                <Textarea
                                                    value={h}
                                                    onChange={e => updateWorkHighlight(i, j, e.target.value)}
                                                    rows={2}
                                                    className="border-zinc-700 bg-zinc-800 text-sm text-white"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeWorkHighlight(i, j)}
                                                    className="mt-1 h-7 w-7 shrink-0 text-zinc-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-white">{job.position} <span className="font-normal text-zinc-400">at {job.name}</span></p>
                                            <p className="text-xs text-zinc-500">{job.startDate} — {job.endDate || 'Present'}</p>
                                        </div>
                                    </div>
                                    <ul className="mt-2 space-y-1">
                                        {job.highlights?.map((h: string, j: number) => (
                                            <li key={j} className="text-sm text-zinc-300">• {h}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
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
                            {isEditing ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                        <label className="text-xs text-zinc-500">Institution</label>
                                        <Input value={edu.institution || ''} onChange={e => updateEducation(i, 'institution', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500">Degree</label>
                                        <Input value={edu.studyType || ''} onChange={e => updateEducation(i, 'studyType', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500">Field of Study</label>
                                        <Input value={edu.area || ''} onChange={e => updateEducation(i, 'area', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500">End Date</label>
                                        <Input value={edu.endDate || ''} onChange={e => updateEducation(i, 'endDate', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-semibold text-white">{edu.studyType} in {edu.area}</p>
                                    <p className="text-sm text-zinc-400">{edu.institution} {edu.endDate && `• ${edu.endDate}`}</p>
                                </div>
                            )}
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
                            {isEditing ? (
                                <>
                                    <div className="mb-2">
                                        <label className="text-xs text-zinc-500">Category</label>
                                        <Input value={skill.name || ''} onChange={e => updateSkill(i, 'name', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500">Keywords (comma-separated)</label>
                                        <Input value={skill.keywords?.join(', ') || ''} onChange={e => updateSkill(i, 'keywords', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                    </div>
                                </>
                            ) : null}
                            <div className="mt-2 flex flex-wrap gap-1">
                                {!isEditing && <span className="mr-2 text-sm font-medium text-zinc-300">{skill.name}:</span>}
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
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <FolderOpen className="h-5 w-5" />
                            Projects ({data.projects?.length || 0})
                        </CardTitle>
                        {isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addProject}
                                className="text-emerald-400 hover:text-emerald-300"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Project
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(data.projects || []).length === 0 && (
                        <p className="text-sm text-zinc-500">No projects added yet.</p>
                    )}
                    {(data.projects || []).map((proj: any, i: number) => (
                        <div key={i} className="rounded-lg border border-zinc-800 p-4">
                            {isEditing ? (
                                <>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1 space-y-3">
                                            <div className="grid gap-3 md:grid-cols-2">
                                                <div>
                                                    <label className="text-xs text-zinc-500">Project Name</label>
                                                    <Input value={proj.name || ''} onChange={e => updateProject(i, 'name', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-zinc-500">URL</label>
                                                    <Input value={proj.url || ''} onChange={e => updateProject(i, 'url', e.target.value)} placeholder="https://..." className="border-zinc-700 bg-zinc-800 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-500">Description</label>
                                                <Textarea value={proj.description || ''} onChange={e => updateProject(i, 'description', e.target.value)} rows={2} className="border-zinc-700 bg-zinc-800 text-white" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-500">Key Points (one per line)</label>
                                                <Textarea
                                                    value={(proj.highlights || []).join('\n')}
                                                    onChange={e => updateProject(i, 'highlights', e.target.value)}
                                                    rows={3}
                                                    placeholder="Built a system that..."
                                                    className="border-zinc-700 bg-zinc-800 text-sm text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-500">Technologies (comma-separated)</label>
                                                <Input value={proj.keywords?.join(', ') || ''} onChange={e => updateProject(i, 'keywords', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeProject(i)}
                                            className="ml-2 shrink-0 text-zinc-500 hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <p className="font-semibold text-white">{proj.name}</p>
                                    <p className="text-sm text-zinc-400">{proj.description}</p>
                                    {proj.highlights && proj.highlights.length > 0 && (
                                        <ul className="mt-1 space-y-0.5">
                                            {proj.highlights.map((h: string, j: number) => (
                                                <li key={j} className="text-sm text-zinc-300">• {h}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {proj.keywords && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {proj.keywords.map((k: string, j: number) => (
                                                <Badge key={j} variant="outline" className="text-xs">{k}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Award className="h-5 w-5" />
                            Certifications ({data.certifications?.length || 0})
                        </CardTitle>
                        {isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addCertification}
                                className="text-emerald-400 hover:text-emerald-300"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Cert
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {(data.certifications || []).length === 0 && (
                        <p className="text-sm text-zinc-500">No certifications added.</p>
                    )}
                    {(data.certifications || []).map((cert: any, i: number) => (
                        <div key={i} className="rounded-lg border border-zinc-800 p-3">
                            {isEditing ? (
                                <div className="flex items-start justify-between">
                                    <div className="grid flex-1 gap-3 md:grid-cols-3">
                                        <div>
                                            <label className="text-xs text-zinc-500">Name</label>
                                            <Input value={cert.name || ''} onChange={e => updateCertification(i, 'name', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500">Issuer</label>
                                            <Input value={cert.issuer || ''} onChange={e => updateCertification(i, 'issuer', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500">Date</label>
                                            <Input value={cert.date || ''} onChange={e => updateCertification(i, 'date', e.target.value)} className="border-zinc-700 bg-zinc-800 text-white" />
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCertification(i)}
                                        className="ml-2 mt-5 shrink-0 text-zinc-500 hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-sm text-zinc-300">
                                    <p className="font-medium">{cert.name}</p>
                                    <p className="text-zinc-500">{cert.issuer} {cert.date ? `— ${cert.date}` : ''}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Bottom Save (sticky) */}
            {dirty && (
                <div className="sticky bottom-4 z-10 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="lg"
                        className="bg-emerald-600 shadow-lg shadow-emerald-900/30 hover:bg-emerald-700"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            )}
        </div>
    );
}

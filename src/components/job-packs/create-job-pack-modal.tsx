'use client';

import { useState } from 'react';
import { Loader2, Link2, FileText, Upload } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateJobPackModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (packId: string) => void;
}

export function CreateJobPackModal({
    open,
    onClose,
    onCreated,
}: CreateJobPackModalProps) {
    const [tab, setTab] = useState('text');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [jdText, setJdText] = useState('');
    const [jdUrl, setJdUrl] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [roleTitle, setRoleTitle] = useState('');
    const [salaryBand, setSalaryBand] = useState('');
    const [notes, setNotes] = useState('');

    const resetForm = () => {
        setJdText('');
        setJdUrl('');
        setPdfFile(null);
        setCompanyName('');
        setRoleTitle('');
        setSalaryBand('');
        setNotes('');
        setError('');
        setTab('text');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        setError('');

        // Validate at least one input method
        if (tab === 'text' && (!jdText || jdText.trim().length < 50)) {
            setError(
                'Please paste a job description (minimum 50 characters).'
            );
            return;
        }
        if (tab === 'url' && !jdUrl.trim()) {
            setError('Please enter a job posting URL.');
            return;
        }
        if (tab === 'pdf' && !pdfFile) {
            setError('Please select a PDF file.');
            return;
        }

        setLoading(true);
        try {
            let res: Response;

            if (tab === 'pdf' && pdfFile) {
                const formData = new FormData();
                formData.append('jd_pdf', pdfFile);
                if (companyName) formData.append('company_name', companyName);
                if (roleTitle) formData.append('role_title', roleTitle);
                if (salaryBand) formData.append('salary_band', salaryBand);
                if (notes) formData.append('notes', notes);
                res = await fetch('/api/v1/job-intelligence/analyze', {
                    method: 'POST',
                    body: formData,
                });
            } else {
                res = await fetch('/api/v1/job-intelligence/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jd_text: tab === 'text' ? jdText : undefined,
                        jd_url: tab === 'url' ? jdUrl : undefined,
                        company_name: companyName || undefined,
                        role_title: roleTitle || undefined,
                        salary_band: salaryBand || undefined,
                        notes: notes || undefined,
                    }),
                });
            }

            const data = await res.json();

            if (!res.ok) {
                setError(
                    data.error?.message || 'Failed to analyze job description'
                );
                return;
            }

            resetForm();
            onCreated(data.job_pack_id);
        } catch (err) {
            console.error('Create job pack error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="max-w-2xl border-zinc-800 bg-zinc-900 text-white sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Create Job Pack
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Add a job description and our AI will extract key
                        intelligence to help you tailor your application.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab} className="mt-4">
                    <TabsList className="w-full bg-zinc-800">
                        <TabsTrigger
                            value="text"
                            className="flex-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Paste JD Text
                        </TabsTrigger>
                        <TabsTrigger
                            value="url"
                            className="flex-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <Link2 className="mr-2 h-4 w-4" />
                            Paste Job URL
                        </TabsTrigger>
                        <TabsTrigger
                            value="pdf"
                            className="flex-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload PDF
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="mt-4 space-y-4">
                        <div>
                            <Label className="text-zinc-300">
                                Job Description *
                            </Label>
                            <Textarea
                                placeholder="Paste the full job description here..."
                                className="mt-1 min-h-[200px] border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500"
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="url" className="mt-4 space-y-4">
                        <div>
                            <Label className="text-zinc-300">
                                Job Posting URL *
                            </Label>
                            <Input
                                placeholder="https://company.com/careers/role-name"
                                className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500"
                                value={jdUrl}
                                onChange={(e) => setJdUrl(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-zinc-500">
                                We&apos;ll fetch the page and extract the job
                                description text.
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="pdf" className="mt-4 space-y-4">
                        <div>
                            <Label className="text-zinc-300">
                                Job Description PDF *
                            </Label>
                            <div className="mt-1 flex items-center gap-3">
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    className="border-zinc-700 bg-zinc-800 text-zinc-200 file:text-zinc-400"
                                    onChange={(e) =>
                                        setPdfFile(e.target.files?.[0] || null)
                                    }
                                />
                            </div>
                            {pdfFile && (
                                <p className="mt-1 text-xs text-zinc-400">
                                    📄 {pdfFile.name} (
                                    {(pdfFile.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Optional fields */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-zinc-300">
                            Company Name{' '}
                            <span className="text-zinc-500">(optional)</span>
                        </Label>
                        <Input
                            placeholder="Acme Corp"
                            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="text-zinc-300">
                            Role Title{' '}
                            <span className="text-zinc-500">(optional)</span>
                        </Label>
                        <Input
                            placeholder="Senior Frontend Engineer"
                            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500"
                            value={roleTitle}
                            onChange={(e) => setRoleTitle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-zinc-300">
                            Salary Band{' '}
                            <span className="text-zinc-500">(optional)</span>
                        </Label>
                        <Input
                            placeholder="$150K–$180K"
                            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500"
                            value={salaryBand}
                            onChange={(e) => setSalaryBand(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="text-zinc-300">
                            Notes{' '}
                            <span className="text-zinc-500">(optional)</span>
                        </Label>
                        <Input
                            placeholder="Referral from Sarah"
                            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="mt-3 text-sm text-red-400">⚠️ {error}</p>
                )}

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="text-zinc-400 hover:text-zinc-200"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Job →'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

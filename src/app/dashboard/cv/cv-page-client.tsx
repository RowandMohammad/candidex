'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CvUpload } from '@/components/cv/cv-upload';
import { CvEditor } from '@/components/cv/cv-editor';
import { HealthScanPanel } from '@/components/cv/health-scan-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';

interface CvPageClientProps {
    masterCv: {
        id: string;
        json_resume: Record<string, unknown>;
        health_score: number;
        diagnostics: Record<string, unknown>;
        original_filename: string;
        updated_at: string;
    } | null;
}

export function CvPageClient({ masterCv }: CvPageClientProps) {
    const [showUpload, setShowUpload] = useState(!masterCv);
    const router = useRouter();

    if (showUpload || !masterCv) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Master CV</h1>
                        <p className="mt-1 text-zinc-400">Upload your CV to get started</p>
                    </div>
                    {masterCv && (
                        <Button variant="outline" onClick={() => setShowUpload(false)}>
                            Cancel
                        </Button>
                    )}
                </div>
                <CvUpload
                    onUploadComplete={() => {
                        setShowUpload(false);
                        router.refresh();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Master CV</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        {masterCv.original_filename} • Last updated:{' '}
                        {new Date(masterCv.updated_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowUpload(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Re-upload
                    </Button>
                    <Button variant="outline" onClick={() => router.refresh()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="editor">
                <TabsList className="bg-zinc-900">
                    <TabsTrigger value="editor">📝 Editor</TabsTrigger>
                    <TabsTrigger value="health">🏥 Health Scan</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-4">
                    <CvEditor cvId={masterCv.id} initialData={masterCv.json_resume} />
                </TabsContent>

                <TabsContent value="health" className="mt-4">
                    <HealthScanPanel
                        healthScore={masterCv.health_score}
                        diagnostics={masterCv.diagnostics as any}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

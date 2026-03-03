'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CvUploadProps {
    onUploadComplete: () => void;
}

export function CvUpload({ onUploadComplete }: CvUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
            toast.error('Unsupported file type. Use PDF, DOCX, or TXT.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large. Max 10MB.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/v1/cv/ingest', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            toast.success(`CV uploaded! Health Score: ${data.health_score}/100`);
            onUploadComplete();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            toast.error(message);
        } finally {
            setUploading(false);
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }

    return (
        <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {uploading ? (
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
                    <p className="text-sm text-zinc-400">
                        Uploading and analyzing your CV...
                    </p>
                    <p className="text-xs text-zinc-500">
                        This may take 10-30 seconds (AI extraction + health scan)
                    </p>
                </div>
            ) : (
                <>
                    <Upload className="mb-4 h-10 w-10 text-zinc-500" />
                    <p className="mb-2 text-sm text-zinc-300">
                        Drag & drop your CV here, or click to browse
                    </p>
                    <p className="mb-4 text-xs text-zinc-500">
                        Supported: PDF, DOCX, TXT (max 10MB)
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Choose File
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                </>
            )}
        </div>
    );
}

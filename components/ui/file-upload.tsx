"use client";

import { File, FileImage, FileText, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type UploadedFile = {
    id: string;
    name: string;
    size: number;
    type: string;
    previewUrl: string | null; // data URL for images, null for others
    progress: number; // 0–100
    status: "uploading" | "done" | "error";
};

type FileUploadProps = {
    maxFiles?: number;
    acceptedTypes?: string; // e.g. "image/*,.pdf,.docx"
    onFilesChange?: (files: UploadedFile[]) => void;
    className?: string;
};

function getFileIcon(type: string) {
    if (type.startsWith("image/")) return <FileImage size={20} className="text-state-info" />;
    if (type === "application/pdf") return <FileText size={20} className="text-state-error" />;
    return <File size={20} className="text-text-secondary" />;
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Simulate file upload with progress
function simulateUpload(
    id: string,
    onProgress: (id: string, progress: number) => void,
    onDone: (id: string) => void
) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            onProgress(id, 100);
            setTimeout(() => onDone(id), 200);
        } else {
            onProgress(id, Math.round(progress));
        }
    }, 200);
    return () => clearInterval(interval);
}

export function FileUploadDropzone({
    maxFiles = 10,
    acceptedTypes = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt",
    onFilesChange,
    className,
}: FileUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const cancelRefs = useRef<Map<string, () => void>>(new Map());

    const updateFiles = useCallback(
        (updater: (prev: UploadedFile[]) => UploadedFile[]) => {
            setFiles((prev) => {
                const next = updater(prev);
                onFilesChange?.(next);
                return next;
            });
        },
        [onFilesChange]
    );

    const processFiles = useCallback(
        (rawFiles: FileList | null) => {
            if (!rawFiles) return;

            const newFiles: UploadedFile[] = [];

            Array.from(rawFiles)
                .slice(0, maxFiles - files.length)
                .forEach((file) => {
                    const id = `file-${Date.now()}-${Math.random()}`;
                    const isImage = file.type.startsWith("image/");

                    const entry: UploadedFile = {
                        id,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        previewUrl: null,
                        progress: 0,
                        status: "uploading",
                    };

                    newFiles.push(entry);

                    // Generate image preview
                    if (isImage) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            updateFiles((prev) =>
                                prev.map((f) =>
                                    f.id === id ? { ...f, previewUrl: e.target?.result as string } : f
                                )
                            );
                        };
                        reader.readAsDataURL(file);
                    }
                });

            updateFiles((prev) => [...prev, ...newFiles]);

            // Start simulated uploads
            newFiles.forEach((file) => {
                const cancel = simulateUpload(
                    file.id,
                    (id, progress) => {
                        updateFiles((prev) =>
                            prev.map((f) => (f.id === id ? { ...f, progress } : f))
                        );
                    },
                    (id) => {
                        updateFiles((prev) =>
                            prev.map((f) => (f.id === id ? { ...f, status: "done" } : f))
                        );
                        cancelRefs.current.delete(id);
                    }
                );
                cancelRefs.current.set(file.id, cancel);
            });
        },
        [files.length, maxFiles, updateFiles]
    );

    const removeFile = useCallback(
        (id: string) => {
            cancelRefs.current.get(id)?.();
            cancelRefs.current.delete(id);
            updateFiles((prev) => prev.filter((f) => f.id !== id));
        },
        [updateFiles]
    );

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            processFiles(e.dataTransfer.files);
        },
        [processFiles]
    );

    return (
        <div className={cn("space-y-3", className)}>
            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Zona de carga de archivos. Haz clic o arrastra archivos aquí."
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
                className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all",
                    isDragging
                        ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                        : "border-line text-text-secondary hover:border-brand-primary/60 hover:bg-surface2"
                )}
            >
                <Upload
                    size={28}
                    className={isDragging ? "text-brand-primary" : "text-text-muted"}
                />
                <div>
                    <p className="text-sm font-medium text-text-primary">
                        {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar"}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                        Imágenes, PDFs, documentos · Máx {maxFiles} archivos
                    </p>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={acceptedTypes}
                aria-hidden="true"
                className="hidden"
                onChange={(e) => processFiles(e.target.files)}
            />

            {/* File List */}
            {files.length > 0 && (
                <ul className="space-y-2" role="list" aria-label="Archivos adjuntos">
                    {files.map((file) => (
                        <li
                            key={file.id}
                            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
                        >
                            {/* Preview or Icon */}
                            {file.previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={file.previewUrl}
                                    alt={file.name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface2">
                                    {getFileIcon(file.type)}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-text-primary">
                                    {file.name}
                                </p>
                                <p className="text-xs text-text-muted">{formatSize(file.size)}</p>

                                {/* Progress bar */}
                                {file.status === "uploading" && (
                                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface2">
                                        <div
                                            className="h-full rounded-full bg-brand-primary transition-all duration-300"
                                            style={{ width: `${file.progress}%` }}
                                            role="progressbar"
                                            aria-valuenow={file.progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        />
                                    </div>
                                )}
                                {file.status === "done" && (
                                    <p className="mt-0.5 text-xs text-state-success">✓ Subido</p>
                                )}
                            </div>

                            {/* Remove */}
                            <button
                                type="button"
                                aria-label={`Eliminar ${file.name}`}
                                onClick={() => removeFile(file.id)}
                                className="shrink-0 rounded-lg p-1 text-text-muted transition-colors hover:bg-surface2 hover:text-state-error"
                            >
                                <X size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

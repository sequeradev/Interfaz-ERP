"use client";

import { useState } from "react";
import { FileUploadDropzone, type UploadedFile } from "@/components/ui/file-upload";
import { FolderOpen, FileText, ImageIcon, File } from "lucide-react";

function getFileCategory(type: string) {
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf") return "pdf";
    return "other";
}

export default function DocumentsPage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const images = files.filter((f) => getFileCategory(f.type) === "image" && f.status === "done");
    const pdfs = files.filter((f) => getFileCategory(f.type) === "pdf" && f.status === "done");
    const others = files.filter((f) => getFileCategory(f.type) === "other" && f.status === "done");

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                        <FolderOpen size={20} />
                    </div>
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-text-primary">Documentos</h1>
                        <p className="text-sm text-text-secondary">Gestiona y adjunta archivos a tu espacio de trabajo.</p>
                    </div>
                </div>
            </header>

            {/* Upload Zone */}
            <section
                className="rounded-2xl border border-line bg-surface p-6 shadow-soft"
                aria-labelledby="upload-heading"
            >
                <h2 id="upload-heading" className="mb-4 text-base font-semibold text-text-primary">
                    Subir archivos
                </h2>
                <FileUploadDropzone
                    maxFiles={20}
                    acceptedTypes="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    onFilesChange={setFiles}
                />
            </section>

            {/* Gallery: Images */}
            {images.length > 0 && (
                <section aria-labelledby="images-heading">
                    <h2
                        id="images-heading"
                        className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary"
                    >
                        <ImageIcon size={15} />
                        Imágenes ({images.length})
                    </h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {images.map((file) => (
                            <div
                                key={file.id}
                                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface2"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={file.previewUrl!}
                                    alt={file.name}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <p className="truncate text-xs font-medium text-white">{file.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PDFs */}
            {pdfs.length > 0 && (
                <section aria-labelledby="pdfs-heading">
                    <h2
                        id="pdfs-heading"
                        className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary"
                    >
                        <FileText size={15} />
                        PDFs ({pdfs.length})
                    </h2>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {pdfs.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-state-error/10 text-state-error">
                                    <FileText size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-muted">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Others */}
            {others.length > 0 && (
                <section aria-labelledby="other-heading">
                    <h2
                        id="other-heading"
                        className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary"
                    >
                        <File size={15} />
                        Otros documentos ({others.length})
                    </h2>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {others.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface2 text-text-secondary">
                                    <File size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-muted">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty state */}
            {files.filter((f) => f.status === "done").length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
                    <FolderOpen size={36} className="text-text-muted" />
                    <p className="text-sm font-medium text-text-secondary">Aún no hay archivos</p>
                    <p className="text-xs text-text-muted">Arrastra o selecciona archivos en la zona de arriba.</p>
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[FlowOps Error]", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 animate-fade-up">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-state-error/10 text-state-error">
                <AlertTriangle size={24} />
            </div>
            <div className="text-center">
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                    Algo salió mal
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                    {error.message ?? "Error inesperado en la aplicación."}
                </p>
                {error.digest && (
                    <p className="mt-1 font-mono text-xs text-text-muted">ID: {error.digest}</p>
                )}
            </div>
            <button
                type="button"
                onClick={reset}
                className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
            >
                <RefreshCw size={14} />
                Reintentar
            </button>
        </div>
    );
}

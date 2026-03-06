"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className={`h-8 w-8 rounded-lg bg-surface2 ${className ?? ""}`}
                aria-hidden="true"
            />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-text-secondary transition-colors hover:bg-surface2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info ${className ?? ""}`}
        >
            {isDark ? <Moon size={15} /> : <Sun size={15} />}
        </button>
    );
}

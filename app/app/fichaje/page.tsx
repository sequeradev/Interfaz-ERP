"use client";

import { useCallback, useEffect, useState } from "react";
import { LogIn, LogOut, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import {
    useFichajeStore,
    formatMinutes,
    formatTime,
    getStatusColor,
} from "@/lib/store/fichajeStore";
import { cn } from "@/lib/cn";

// ── Huge live clock ───────────────────────────────────────
function HugeClock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!time) {
        return (
            <div
                className="flex items-baseline justify-center gap-1 select-none font-mono font-bold leading-none tracking-tight"
                aria-live="polite"
                aria-label="Cargando hora"
            >
                <span className="text-[10rem] text-text-muted sm:text-[12rem] xl:text-[14rem]">
                    --
                </span>
                <span className="text-[5rem] text-text-muted/50 sm:text-[6rem] xl:text-[7rem]">
                    :--
                </span>
            </div>
        );
    }

    const hm = time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const ss = time.getSeconds().toString().padStart(2, "0");

    return (
        <div
            className="flex items-baseline justify-center gap-1 select-none font-mono font-bold leading-none tracking-tight"
            aria-live="polite"
            aria-label="Hora actual"
        >
            <span className="text-[10rem] text-text-primary sm:text-[12rem] xl:text-[14rem]">
                {hm}
            </span>
            <span className="animate-pulse text-[5rem] text-text-muted sm:text-[6rem] xl:text-[7rem]">
                :{ss}
            </span>
        </div>
    );
}

// ── Big stat card ─────────────────────────────────────────
function BigStat({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color?: "green" | "red" | "yellow" | "default";
}) {
    const valueColor =
        color === "green"
            ? "text-state-success"
            : color === "red"
                ? "text-state-error"
                : color === "yellow"
                    ? "text-state-warning"
                    : "text-text-primary";

    return (
        <div className="flex flex-col items-center rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
            <p className={`font-mono text-5xl font-bold sm:text-6xl xl:text-7xl ${valueColor}`}>
                {value}
            </p>
            <p className="mt-2 text-base font-medium text-text-secondary sm:text-lg">{label}</p>
        </div>
    );
}

// ── Collapsible today timeline ────────────────────────────
function TodayHistory() {
    const getTodayRecords = useFichajeStore((s) => s.getTodayRecords);
    const deleteRecord = useFichajeStore((s) => s.deleteRecord);
    const editRecord = useFichajeStore((s) => s.editRecord);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const records = [...getTodayRecords()].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const today = new Date().toISOString().slice(0, 10);

    if (records.length === 0) return null;

    // Pair in→out
    const pairs: Array<{ in?: (typeof records)[0]; out?: (typeof records)[0] }> = [];
    for (const r of records) {
        if (r.type === "in") pairs.push({ in: r });
        else if (pairs.length > 0 && !pairs[pairs.length - 1].out) {
            pairs[pairs.length - 1].out = r;
        }
    }

    function startEdit(r: (typeof records)[0]) {
        setEditingId(r.id);
        setEditValue(r.timestamp.slice(0, 16));
    }
    function saveEdit(id: string) {
        if (!editValue) return;
        editRecord(today, id, new Date(editValue).toISOString());
        setEditingId(null);
    }

    return (
        <div className="rounded-2xl border border-line bg-surface shadow-soft overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between px-5 py-4 text-base font-semibold text-text-primary hover:bg-surface2 transition-colors"
                aria-expanded={open}
            >
                Mis fichajes de hoy ({records.length} registros)
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {open && (
                <div className="divide-y divide-line border-t border-line">
                    {pairs.map((pair, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-4 px-5 py-3 text-sm">
                            {pair.in && (
                                <div className="flex items-center gap-1.5">
                                    <LogIn size={14} className="text-state-success" />
                                    {editingId === pair.in.id ? (
                                        <input
                                            type="datetime-local"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => saveEdit(pair.in!.id)}
                                            autoFocus
                                            className="rounded border border-line bg-surface2 px-2 py-0.5 text-xs"
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => startEdit(pair.in!)}
                                            className="font-mono font-medium text-text-primary hover:text-brand-primary"
                                        >
                                            {formatTime(pair.in.timestamp)}
                                        </button>
                                    )}
                                </div>
                            )}
                            {pair.out && (
                                <>
                                    <span className="text-text-muted">→</span>
                                    <div className="flex items-center gap-1.5">
                                        <LogOut size={14} className="text-state-error" />
                                        {editingId === pair.out.id ? (
                                            <input
                                                type="datetime-local"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => saveEdit(pair.out!.id)}
                                                autoFocus
                                                className="rounded border border-line bg-surface2 px-2 py-0.5 text-xs"
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => startEdit(pair.out!)}
                                                className="font-mono font-medium text-text-primary hover:text-brand-primary"
                                            >
                                                {formatTime(pair.out.timestamp)}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                            {!pair.out && (
                                <span className="flex items-center gap-1 text-xs text-state-success">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-state-success" />
                                    En curso
                                </span>
                            )}
                            <div className="ml-auto flex gap-1">
                                {pair.in && (
                                    <button
                                        type="button"
                                        onClick={() => startEdit(pair.in!)}
                                        className="rounded p-1 text-text-muted hover:text-brand-primary"
                                        aria-label="Editar"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                )}
                                {pair.in && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            deleteRecord(today, pair.in!.id);
                                            if (pair.out) deleteRecord(today, pair.out.id);
                                        }}
                                        className="rounded p-1 text-text-muted hover:text-state-error"
                                        aria-label="Eliminar"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main fichaje page ─────────────────────────────────────
export default function FichajePage() {
    const hydrate = useFichajeStore((s) => s.hydrate);
    const status = useFichajeStore((s) => s.status);
    const ficharEntrada = useFichajeStore((s) => s.ficharEntrada);
    const ficharSalida = useFichajeStore((s) => s.ficharSalida);
    const getTodayWorkedMinutes = useFichajeStore((s) => s.getTodayWorkedMinutes);
    const getWeekWorkedMinutes = useFichajeStore((s) => s.getWeekWorkedMinutes);
    const getTodayRecords = useFichajeStore((s) => s.getTodayRecords);

    // Hydrate from localStorage on first client render
    useEffect(() => {
        hydrate();
    }, [hydrate]);

    // Live refresh every 30s while working
    const [, setTick] = useState(0);
    useEffect(() => {
        if (status !== "in") return;
        const id = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(id);
    }, [status]);

    const todayMins = getTodayWorkedMinutes();
    const weekMins = getWeekWorkedMinutes();
    const TARGET_DAY = 480;
    const TARGET_WEEK = 2400;

    const dayColor = getStatusColor(todayMins, TARGET_DAY);
    const weekColor = getStatusColor(weekMins, TARGET_WEEK);
    const overtimeMins = todayMins - TARGET_DAY;

    // Find time of first entry today
    const todayRecords = getTodayRecords();
    const firstIn = [...todayRecords]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .find((r) => r.type === "in");

    const isIn = status === "in";

    const handleFichar = useCallback(() => {
        if (status === "out") ficharEntrada();
        else ficharSalida();
    }, [status, ficharEntrada, ficharSalida]);

    return (
        <div className="flex flex-col items-center gap-6 animate-fade-up pb-8">

            {/* ── HUGE CLOCK ── */}
            <div
                className={cn(
                    "w-full rounded-3xl border p-6 text-center shadow-lift sm:p-10",
                    isIn
                        ? "border-state-success/30 bg-gradient-to-br from-state-success/5 via-surface to-surface"
                        : "border-state-error/20 bg-gradient-to-br from-state-error/5 via-surface to-surface"
                )}
            >
                <HugeClock />

                {/* ── STATUS TEXT ── */}
                <p
                    className={cn(
                        "mt-2 text-2xl font-extrabold tracking-wide uppercase sm:text-3xl xl:text-4xl",
                        isIn ? "text-state-success" : "text-state-error"
                    )}
                >
                    {isIn
                        ? `Estás dentro desde las ${firstIn ? formatTime(firstIn.timestamp) : "—"}`
                        : "Aún no has fichado"}
                </p>
            </div>

            {/* ── GIANT PUNCH BUTTON ── */}
            <button
                type="button"
                onClick={handleFichar}
                aria-label={isIn ? "Fichar salida" : "Fichar entrada"}
                className={cn(
                    "w-full rounded-3xl py-10 px-8 text-4xl font-extrabold text-white uppercase tracking-widest shadow-lift",
                    "transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]",
                    "flex items-center justify-center gap-5 sm:text-5xl xl:text-6xl",
                    isIn
                        ? "bg-state-error hover:opacity-90"
                        : "bg-state-success hover:opacity-90"
                )}
            >
                {isIn ? (
                    <>
                        <LogOut size={56} strokeWidth={2.5} />
                        Fichar Salida
                    </>
                ) : (
                    <>
                        <LogIn size={56} strokeWidth={2.5} />
                        Fichar Entrada
                    </>
                )}
            </button>

            {/* ── 3 BIG STAT CARDS ── */}
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                <BigStat
                    label="Hoy"
                    value={formatMinutes(todayMins)}
                    color={dayColor === "green" ? "green" : dayColor === "yellow" ? "yellow" : "default"}
                />
                <BigStat
                    label="Esta semana"
                    value={formatMinutes(weekMins)}
                    color={weekColor === "green" ? "green" : weekColor === "yellow" ? "yellow" : "default"}
                />
                <BigStat
                    label="Overtime"
                    value={
                        overtimeMins > 0
                            ? `+${formatMinutes(overtimeMins)}`
                            : overtimeMins < -30
                                ? `-${formatMinutes(Math.abs(overtimeMins))}`
                                : "—"
                    }
                    color={overtimeMins > 0 ? "green" : overtimeMins < -30 ? "red" : "default"}
                />
            </div>

            {/* ── Collapsible history ── */}
            <div className="w-full">
                <TodayHistory />
            </div>
        </div>
    );
}

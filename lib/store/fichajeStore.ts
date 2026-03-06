import { create } from "zustand";
import { apiClockIn, apiClockOut } from "@/lib/api/services";
import { getSession } from "@/lib/auth";

// ── Types ────────────────────────────────────────────────
export type FichajeRecord = {
    id: string;
    type: "in" | "out";
    timestamp: string; // ISO
    note?: string;
    taskId?: string;
    taskTitle?: string;
    memberId?: string;
    memberName?: string;
    editedBy?: "admin";
};

export type FichajeDay = {
    date: string; // YYYY-MM-DD
    records: FichajeRecord[];
};

export type ClockStatus = "out" | "in";

export type FichajeEntryMeta = {
    note?: string;
    taskId?: string;
    taskTitle?: string;
    memberId?: string;
    memberName?: string;
};

// ── Helpers ──────────────────────────────────────────────
export function minutesBetween(a: string, b: string): number {
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

export function calcWorkedMinutes(records: FichajeRecord[]): number {
    let total = 0;
    const sorted = [...records].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    let lastIn: string | null = null;
    for (const r of sorted) {
        if (r.type === "in") {
            lastIn = r.timestamp;
        } else if (r.type === "out" && lastIn !== null) {
            total += minutesBetween(lastIn, r.timestamp);
            lastIn = null;
        }
    }
    if (lastIn !== null) {
        total += minutesBetween(lastIn, new Date().toISOString());
    }
    return total;
}

export function formatMinutes(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function getStatusColor(
    workedMins: number,
    targetMins: number
): "green" | "yellow" | "red" {
    if (workedMins >= targetMins) return "green";
    if (workedMins >= targetMins * 0.75) return "yellow";
    return "red";
}

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

function isUuid(value?: string | null): boolean {
    return Boolean(
        value &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    );
}

// ── Demo seed data (client-only) ─────────────────────────
function buildSeedDays(): FichajeDay[] {
    const seed: FichajeDay[] = [];
    let count = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (count < 5) {
        const dow = d.getDay();
        if (dow >= 1 && dow <= 5) {
            const ymd = d.toISOString().slice(0, 10);
            const inTime = new Date(
                `${ymd}T08:${String(Math.floor(Math.random() * 20)).padStart(2, "0")}:00`
            );
            const outTime = new Date(inTime.getTime() + (7 + Math.random() * 2) * 3600000);
            seed.push({
                date: ymd,
                records: [
                    { id: `seed-in-${count}`, type: "in", timestamp: inTime.toISOString() },
                    { id: `seed-out-${count}`, type: "out", timestamp: outTime.toISOString() },
                ],
            });
            count++;
        }
        d.setDate(d.getDate() - 1);
    }
    return seed;
}

// ── localStorage helpers (client-only) ───────────────────
const LS_KEY = "flowops-fichaje-v4";

type PersistedState = { days: FichajeDay[]; status: ClockStatus; activeTimesheetId: string | null };

function loadFromStorage(): PersistedState | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as PersistedState;
    } catch {
        return null;
    }
}

function saveToStorage(state: PersistedState) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
}

// ── Store (NO zustand/middleware – SSR safe) ─────────────
type FichajeStore = {
    days: FichajeDay[];
    status: ClockStatus;
    activeTimesheetId: string | null;
    _hydrated: boolean;
    hydrate: () => void;

    ficharEntrada: (meta?: FichajeEntryMeta) => void;
    ficharSalida: (meta?: FichajeEntryMeta) => void;
    editRecord: (dayDate: string, recordId: string, newTimestamp: string) => void;
    deleteRecord: (dayDate: string, recordId: string) => void;

    getTodayRecords: () => FichajeRecord[];
    getTodayWorkedMinutes: () => number;
    getWeekWorkedMinutes: () => number;
    getDayWorkedMinutes: (date: string) => number;
    getWeekDays: () => Array<{ date: string; worked: number; target: number }>;
};

export const useFichajeStore = create<FichajeStore>((set, get) => ({
    // Start empty for SSR – hydrate() fills from localStorage
    days: [],
    status: "out",
    activeTimesheetId: null,
    _hydrated: false,

    hydrate() {
        if (get()._hydrated) return;
        const saved = loadFromStorage();
        if (saved) {
            set({
                days: saved.days,
                status: saved.status,
                activeTimesheetId: saved.activeTimesheetId ?? null,
                _hydrated: true
            });
        } else {
            set({ days: buildSeedDays(), status: "out", activeTimesheetId: null, _hydrated: true });
        }
    },

    ficharEntrada(meta) {
        const now = new Date().toISOString();
        const today = todayStr();
        const record: FichajeRecord = {
            id: `r-${Date.now()}`,
            type: "in",
            timestamp: now,
            note: meta?.note,
            taskId: meta?.taskId,
            taskTitle: meta?.taskTitle,
            memberId: meta?.memberId,
            memberName: meta?.memberName,
        };
        set((s) => {
            const existing = s.days.find((d) => d.date === today);
            const days = existing
                ? s.days.map((d) =>
                    d.date === today ? { ...d, records: [...d.records, record] } : d
                )
                : [{ date: today, records: [record] }, ...s.days];
            const next = { days, status: "in" as ClockStatus, activeTimesheetId: s.activeTimesheetId };
            saveToStorage(next);
            return next;
        });

        const session = getSession();
        if (session?.token && session.token !== "mock") {
            void (async () => {
                try {
                    const response = await apiClockIn(session.token, {
                        tarea_id: isUuid(meta?.taskId) ? meta?.taskId : undefined,
                        notas: meta?.note
                    });

                    set((s) => {
                        const next = {
                            days: s.days,
                            status: s.status,
                            activeTimesheetId: response.timesheet_id
                        };
                        saveToStorage(next);
                        return { activeTimesheetId: response.timesheet_id };
                    });
                } catch {
                    // Keep local clock-in if API fails.
                }
            })();
        }
    },

    ficharSalida(meta) {
        const now = new Date().toISOString();
        const today = todayStr();
        const record: FichajeRecord = {
            id: `r-${Date.now()}`,
            type: "out",
            timestamp: now,
            note: meta?.note,
            memberId: meta?.memberId,
            memberName: meta?.memberName,
        };
        set((s) => {
            const existing = s.days.find((d) => d.date === today);
            const days = existing
                ? s.days.map((d) =>
                    d.date === today ? { ...d, records: [...d.records, record] } : d
                )
                : [{ date: today, records: [record] }, ...s.days];
            const next = { days, status: "out" as ClockStatus, activeTimesheetId: null };
            saveToStorage(next);
            return next;
        });

        const session = getSession();
        const activeTimesheetId = get().activeTimesheetId;
        if (session?.token && session.token !== "mock" && activeTimesheetId && isUuid(activeTimesheetId)) {
            void (async () => {
                try {
                    await apiClockOut(session.token, activeTimesheetId, meta?.note);
                } catch {
                    // Keep local clock-out if API fails.
                }
            })();
        }
    },

    editRecord(dayDate, recordId, newTimestamp) {
        set((s) => {
            const days = s.days.map((d) =>
                d.date === dayDate
                    ? {
                        ...d,
                        records: d.records.map((r) =>
                            r.id === recordId
                                ? { ...r, timestamp: newTimestamp, editedBy: "admin" as const }
                                : r
                        ),
                    }
                    : d
            );
            saveToStorage({ days, status: s.status, activeTimesheetId: s.activeTimesheetId });
            return { days };
        });
    },

    deleteRecord(dayDate, recordId) {
        set((s) => {
            const days = s.days.map((d) =>
                d.date === dayDate
                    ? { ...d, records: d.records.filter((r) => r.id !== recordId) }
                    : d
            );
            saveToStorage({ days, status: s.status, activeTimesheetId: s.activeTimesheetId });
            return { days };
        });
    },

    getTodayRecords() {
        const today = todayStr();
        return get().days.find((d) => d.date === today)?.records ?? [];
    },

    getTodayWorkedMinutes() {
        return calcWorkedMinutes(get().getTodayRecords());
    },

    getWeekWorkedMinutes() {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        let total = 0;
        for (const day of get().days) {
            if (new Date(day.date) >= monday) {
                total += calcWorkedMinutes(day.records);
            }
        }
        return total;
    },

    getDayWorkedMinutes(date) {
        const day = get().days.find((d) => d.date === date);
        return day ? calcWorkedMinutes(day.records) : 0;
    },

    getWeekDays() {
        const now = new Date();
        const dow = (now.getDay() + 6) % 7;
        const monday = new Date(now);
        monday.setDate(now.getDate() - dow);
        monday.setHours(0, 0, 0, 0);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const ymd = d.toISOString().slice(0, 10);
            return {
                date: ymd,
                worked: get().getDayWorkedMinutes(ymd),
                target: i < 5 ? 480 : 0,
            };
        });
    },
}));

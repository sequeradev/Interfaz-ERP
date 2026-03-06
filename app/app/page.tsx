"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useFichajeStore } from "@/lib/store/fichajeStore";

// ── Live clock (medium size for dashboard) ───────────────
function DashClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    return (
      <div className="text-center select-none" aria-live="polite" aria-label="Cargando hora">
        <p className="font-mono text-6xl font-bold tracking-tight text-text-muted sm:text-7xl">
          --:--
        </p>
        <p className="mt-1 text-base text-text-secondary">Cargando fecha...</p>
      </div>
    );
  }

  return (
    <div className="text-center select-none" aria-live="polite" aria-label="Hora actual">
      <p className="font-mono text-6xl font-bold tracking-tight text-text-primary sm:text-7xl">
        {time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p className="mt-1 capitalize text-base text-text-secondary">
        {time.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
      </p>
    </div>
  );
}

// ── Big team stat card ───────────────────────────────────
function TeamCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}>
        <Icon size={32} />
      </div>
      <p className="font-mono text-5xl font-bold text-text-primary sm:text-6xl">{value}</p>
      <p className="text-center text-base font-medium text-text-secondary sm:text-lg">{label}</p>
    </div>
  );
}

// ── Simulated team data based on the seeded fichaje store ─
function useTeamStats() {
  const days = useFichajeStore((s) => s.days);
  const myStatus = useFichajeStore((s) => s.status);
  const TOTAL_TEAM = 5; // mock team size

  const today = new Date().toISOString().slice(0, 10);
  const todayDay = days.find((d) => d.date === today);
  const myFichadoHoy =
    todayDay?.records.some((r) => r.type === "in") ?? false;

  // Simulate 2 random other teammates always working (for demo)
  const otrosActivos = myStatus === "in" ? 3 : 2;
  const trabajandoAhora = myStatus === "in" ? otrosActivos : otrosActivos;
  const faltanFichar = TOTAL_TEAM - (myFichadoHoy ? otrosActivos + 1 : otrosActivos);

  // Total team hours today (simulated)
  const horasEquipo = myStatus === "in" ? "18h 34m" : "13h 10m";

  return { trabajandoAhora, faltanFichar, horasEquipo, TOTAL_TEAM };
}

export default function DashboardPage() {
  const { trabajandoAhora, faltanFichar, horasEquipo, TOTAL_TEAM } = useTeamStats();
  const myStatus = useFichajeStore((s) => s.status);
  const hydrate = useFichajeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Inicio
        </h1>
        <p className="mt-1 text-base text-text-secondary">Vista general del equipo</p>
      </div>

      {/* Clock */}
      <div className="rounded-3xl border border-line bg-surface p-8 shadow-soft">
        <DashClock />
      </div>

      {/* Team stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TeamCard
          icon={UserCheck}
          iconBg="bg-state-success/10"
          iconColor="text-state-success"
          value={`${trabajandoAhora}/${TOTAL_TEAM}`}
          label="Trabajando ahora"
        />
        <TeamCard
          icon={UserX}
          iconBg={faltanFichar > 0 ? "bg-state-error/10" : "bg-surface2"}
          iconColor={faltanFichar > 0 ? "text-state-error" : "text-text-muted"}
          value={faltanFichar}
          label="Faltan fichar"
        />
        <TeamCard
          icon={Clock}
          iconBg="bg-brand-primary/10"
          iconColor="text-brand-primary"
          value={horasEquipo}
          label="Horas equipo hoy"
        />
      </div>

      {/* My status badge */}
      <div
        className={`flex items-center justify-center gap-3 rounded-2xl border px-6 py-4 text-lg font-semibold ${myStatus === "in"
          ? "border-state-success/30 bg-state-success/10 text-state-success"
          : "border-state-error/20 bg-state-error/5 text-state-error"
          }`}
      >
        <span
          className={`h-3 w-3 rounded-full ${myStatus === "in" ? "animate-pulse bg-state-success" : "bg-state-error"}`}
        />
        {myStatus === "in" ? "Tú estás trabajando ahora" : "Tú aún no has fichado hoy"}
      </div>

      {/* BIG CTA button */}
      <Link
        href="/app/fichaje"
        className="flex w-full items-center justify-center gap-4 rounded-3xl bg-brand-primary px-8 py-7 text-2xl font-bold text-white shadow-lift transition-all hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] sm:text-3xl"
        aria-label="Ir a mi fichaje personal"
      >
        <Clock size={36} />
        Ir a mi fichaje
        <ArrowRight size={28} />
      </Link>

      {/* Team members row */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-secondary">
          <Users size={15} />
          Equipo ({TOTAL_TEAM} personas)
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "Ana G.", active: true },
            { name: "Carlos M.", active: true },
            { name: "Laura P.", active: myStatus === "in" },
            { name: "Tú", active: myStatus === "in" },
            { name: "Rubén T.", active: false },
          ].map((m) => (
            <div
              key={m.name}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${m.active
                ? "border-state-success/30 bg-state-success/8 text-state-success"
                : "border-line bg-surface2 text-text-muted"
                }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${m.active ? "animate-pulse bg-state-success" : "bg-text-muted"}`}
              />
              {m.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

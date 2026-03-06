"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CheckSquare, Calendar, FolderOpen, Settings, LogOut, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useFichajeStore } from "@/lib/store/fichajeStore";
import { useTeamContext } from "@/context/TeamContext";
import { cn } from "@/lib/cn";
import type { MockSession } from "@/lib/auth";

const navItems = [
  { label: "Fichaje", href: "/app/fichaje", icon: Clock },
  { label: "Inicio", href: "/app", icon: LayoutDashboard },
  { label: "Equipos", href: "/app/teams", icon: Users },
  { label: "Tareas", href: "/app/tasks", icon: CheckSquare },
  { label: "Calendario", href: "/app/calendar", icon: Calendar },
  { label: "Documentos", href: "/app/documents", icon: FolderOpen },
  { label: "Configuración", href: "#", icon: Settings },
];

type LeftSidebarProps = {
  session: MockSession;
  onSignOut: () => void;
};

export function LeftSidebar({ session, onSignOut }: LeftSidebarProps) {
  const pathname = usePathname();
  const { currentTeam } = useTeamContext();

  return (
    <aside className="md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:w-[260px] md:flex-col md:border-r md:border-line md:bg-surface md:px-4 md:py-5">
      {/* Mobile top bar */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-line bg-surface px-4 py-3 md:mx-0 md:hidden">
        <div>
          <p className="font-heading text-xl font-semibold text-brand-primary">FlowOps</p>
          <p className="text-xs text-text-secondary">{currentTeam?.name ?? "Espacio de trabajo"}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface2"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="border-b border-line bg-surface px-4 py-2 md:hidden" aria-label="Navegación móvil">
        <ul className="flex flex-wrap gap-1 pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href !== "#" &&
              (pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(`${item.href}/`)));
            return (
              <li key={`mobile-${item.label}`}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface2 text-brand-primary"
                      : "text-text-secondary hover:bg-surface2"
                  )}
                >
                  <Icon size={13} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-1 md:flex-col">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-heading text-2xl font-bold text-brand-primary">FlowOps</p>
            <p className="text-xs text-text-secondary">{currentTeam?.name ?? "Espacio de trabajo"}</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Nav */}
        <nav aria-label="Navegación principal" className="flex-1">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href !== "#" &&
                (pathname === item.href ||
                  (item.href !== "/app" && pathname.startsWith(`${item.href}/`)));
              const isFichaje = item.href === "/app/fichaje";
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const fichajeStatus = isFichaje ? useFichajeStore.getState().status : null;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-text-secondary hover:bg-surface2 hover:text-text-primary"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={16} className={isActive ? "text-brand-primary" : ""} />
                    <span className="flex-1">{item.label}</span>
                    {isFichaje && fichajeStatus === "in" && (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-state-success" aria-label="Fichado" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>


        {/* User card */}
        <div className="mt-auto">
          <div className="rounded-2xl border border-line bg-surface2 p-3.5">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-secondary/15 text-xs font-bold text-brand-secondary"
                aria-hidden="true"
              >
                {session.user.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-text-primary">{session.user.name}</p>
                <p className="truncate font-mono text-xs text-text-muted">{session.user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Cerrar sesión"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2 text-xs font-medium text-text-secondary transition-colors hover:border-state-error/40 hover:bg-state-error/5 hover:text-state-error"
            >
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

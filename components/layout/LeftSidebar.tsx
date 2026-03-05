"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTeamContext } from "@/context/TeamContext";
import { cn } from "@/lib/cn";
import type { MockSession } from "@/lib/auth";

const navItems = [
  { label: "Inicio", href: "/app" },
  { label: "Chat", href: "/app/chat" },
  { label: "Equipos", href: "/app/teams" },
  { label: "Tareas", href: "/app/tasks" },
  { label: "Calendario", href: "/app/calendar" },
  { label: "Configuracion", href: "#" }
];

type LeftSidebarProps = {
  session: MockSession;
  onSignOut: () => void;
};

export function LeftSidebar({ session, onSignOut }: LeftSidebarProps) {
  const pathname = usePathname();
  const { currentTeam } = useTeamContext();

  return (
    <aside className="md:fixed md:inset-y-0 md:left-0 md:z-20 md:w-[260px] md:border-r md:border-line md:bg-surface md:px-5 md:py-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-line bg-surface px-4 py-3 md:mx-0 md:block md:border-none md:bg-transparent md:p-0">
        <div className="space-y-0.5">
          <p className="font-heading text-2xl font-semibold text-brand-primary">FlowOps</p>
          <p className="text-sm text-text-secondary">{currentTeam?.name ?? "Espacio de trabajo"}</p>
        </div>

        <Button type="button" variant="secondary" className="w-auto px-4 md:hidden" onClick={onSignOut}>
          Cerrar sesion
        </Button>
      </div>

      <nav className="border-b border-line bg-surface px-4 py-2 md:hidden" aria-label="Navegacion movil">
        <ul className="flex gap-1 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const isActive =
              item.href !== "#" &&
              (pathname === item.href ||
                (item.href !== "/app" && item.href !== "#" && pathname.startsWith(`${item.href}/`)));

            return (
              <li key={`mobile-${item.label}`}>
                <Link
                  href={item.href}
                  className={cn(
                    "block whitespace-nowrap rounded-lg px-3 py-1.5 text-base font-medium transition-colors",
                    isActive ? "bg-[#e9f0f7] text-brand-primary" : "text-text-secondary hover:bg-[#f3f7fa]"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav className="hidden pt-8 md:block" aria-label="Navegacion principal">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href !== "#" &&
              (pathname === item.href ||
                (item.href !== "/app" && item.href !== "#" && pathname.startsWith(`${item.href}/`)));

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-base font-medium transition-colors",
                    isActive
                      ? "bg-[#e9f0f7] text-brand-primary"
                      : "text-text-secondary hover:bg-[#f3f7fa] hover:text-text-primary"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden md:absolute md:bottom-6 md:left-5 md:right-5 md:block">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-secondary/15 text-sm font-semibold text-brand-secondary"
              aria-hidden="true"
            >
              DU
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary">{session.user.name}</p>
              <p className="font-mono text-xs text-text-secondary">{session.user.email}</p>
            </div>
          </div>

          <Button type="button" variant="secondary" className="mt-4" onClick={onSignOut}>
            Cerrar sesion
          </Button>
        </div>
      </div>
    </aside>
  );
}

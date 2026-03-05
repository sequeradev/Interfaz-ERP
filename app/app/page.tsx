"use client";

import { useMemo } from "react";
import { useTeamContext } from "@/context/TeamContext";
import { useWorkContext } from "@/context/WorkContext";
import { getSession } from "@/lib/auth";
import { mockUsersByTeam } from "@/lib/mockUsers";

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStatusLabel(status: "todo" | "in_progress" | "done"): string {
  if (status === "todo") {
    return "Por hacer";
  }
  if (status === "in_progress") {
    return "En progreso";
  }
  return "Completada";
}

export default function AppHomePage() {
  const { currentTeam } = useTeamContext();
  const { tasksByTeam, feedPosts } = useWorkContext();
  const session = getSession();

  const teamUsers = currentTeam ? mockUsersByTeam[currentTeam.id] ?? [] : [];
  const currentUser =
    teamUsers.find((user) => user.email === session?.user.email || user.name === session?.user.name) ??
    teamUsers[0] ??
    null;

  const teamTasks = currentTeam ? tasksByTeam[currentTeam.id] ?? [] : [];

  const pendingTasksCount = useMemo(() => {
    if (!currentUser) {
      return 0;
    }
    return teamTasks.filter((task) => task.assigneeId === currentUser.id && task.status !== "done").length;
  }, [teamTasks, currentUser]);

  const unreadMessagesCount = useMemo(() => {
    if (!currentTeam) {
      return 0;
    }

    return feedPosts.filter((post) => post.teamId === currentTeam.id && post.author !== (session?.user.name ?? "")).length;
  }, [feedPosts, currentTeam, session?.user.name]);

  const todayTasks = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const todayKey = getTodayKey();

    return teamTasks.filter((task) => task.assigneeId === currentUser.id && task.dueDate === todayKey);
  }, [teamTasks, currentUser]);

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="font-heading text-4xl font-semibold text-text-primary">Inicio</h1>
        <p className="mt-2 text-base text-text-secondary">
          Resumen rapido de {currentUser?.name ?? session?.user.name ?? "tu usuario"} en {currentTeam?.name ?? "tu equipo"}.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-text-secondary">Tareas pendientes</p>
          <p className="mt-3 font-heading text-5xl font-semibold text-text-primary">{pendingTasksCount}</p>
        </article>

        <article className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-text-secondary">Mensajes no leidos</p>
          <p className="mt-3 font-heading text-5xl font-semibold text-text-primary">{unreadMessagesCount}</p>
        </article>
      </div>

      <article className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="font-heading text-2xl font-semibold text-text-primary">Indice de tareas de hoy</h2>
        <ul className="mt-4 space-y-3">
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <li key={task.id} className="rounded-lg bg-[#f7fafc] px-4 py-3">
                <p className="text-base font-medium text-text-primary">{task.title}</p>
                <p className="text-sm text-text-secondary">Estado: {getStatusLabel(task.status)}</p>
              </li>
            ))
          ) : (
            <li className="rounded-lg bg-[#f7fafc] px-4 py-3 text-base text-text-secondary">
              No tienes tareas programadas para hoy.
            </li>
          )}
        </ul>
      </article>
    </section>
  );
}

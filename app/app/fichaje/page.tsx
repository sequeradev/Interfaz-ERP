"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, LogOut, PlayCircle, SquareStack, TimerReset } from "lucide-react";
import { TaskCheckoutModal, type TaskCheckoutValues } from "@/components/tasks/TaskCheckoutModal";
import { Button } from "@/components/ui/button";
import { useTeamContext } from "@/context/TeamContext";
import { useWorkContext } from "@/context/WorkContext";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { getUsersByTeam, resolveCurrentUser } from "@/lib/mockUsers";
import { formatMinutes, formatTime, minutesBetween, useFichajeStore } from "@/lib/store/fichajeStore";
import type { Task, TaskActivity } from "@/lib/types";

function getPriorityLabel(priority: Task["priority"]): string {
  if (priority === "high") return "Alta";
  if (priority === "low") return "Baja";
  return "Media";
}

function getStatusLabel(status: Task["status"]): string {
  if (status === "in_progress") return "En progreso";
  if (status === "done") return "Completada";
  return "Pendiente";
}
function getTaskCardTone(task: Task): string {
  if (task.status === "in_progress") {
    return "border-brand-primary/30 bg-brand-primary/5";
  }
  return "border-line bg-surface";
}

export default function FichajePage() {
  const { currentTeam } = useTeamContext();
  const { tasksByTeam, updateTask, addFeedEvent } = useWorkContext();
  const session = getSession();
  const teamUsers = getUsersByTeam(currentTeam?.id);
  const currentUser = resolveCurrentUser(currentTeam?.id, session?.user);
  const canManageAssignments = currentTeam?.role === "admin" || currentTeam?.role === "manager";

  const hydrate = useFichajeStore((s) => s.hydrate);
  const status = useFichajeStore((s) => s.status);
  const ficharEntrada = useFichajeStore((s) => s.ficharEntrada);
  const ficharSalida = useFichajeStore((s) => s.ficharSalida);
  const getTodayRecords = useFichajeStore((s) => s.getTodayRecords);
  const getWeekDays = useFichajeStore((s) => s.getWeekDays);
  const getWeekWorkedMinutes = useFichajeStore((s) => s.getWeekWorkedMinutes);

  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status !== "in") {
      return;
    }

    const id = setInterval(() => setTick((value) => value + 1), 30000);
    return () => clearInterval(id);
  }, [status]);

  const teamTasks = currentTeam ? tasksByTeam[currentTeam.id] ?? [] : [];
  const availableTasks = useMemo(
    () =>
      teamTasks.filter((task) => {
        if (task.status === "done") {
          return false;
        }
        if (canManageAssignments) {
          return true;
        }
        return !task.assigneeId || task.assigneeId === currentUser?.id;
      }),
    [canManageAssignments, currentUser?.id, teamTasks]
  );

  useEffect(() => {
    if (!selectedTaskId || !availableTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(availableTasks[0]?.id ?? "");
    }
  }, [availableTasks, selectedTaskId]);

  const selectedTask = useMemo(
    () => availableTasks.find((task) => task.id === selectedTaskId) ?? null,
    [availableTasks, selectedTaskId]
  );

  const todayRecords = getTodayRecords();
  const activeEntry = useMemo(() => {
    const sorted = [...todayRecords].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let opened: (typeof sorted)[number] | null = null;
    for (const record of sorted) {
      if (record.type === "in") {
        opened = record;
      }
      if (record.type === "out") {
        opened = null;
      }
    }

    return opened;
  }, [todayRecords]);

  const activeTask = useMemo(() => {
    if (!activeEntry?.taskId) {
      return null;
    }
    return teamTasks.find((task) => task.id === activeEntry.taskId) ?? null;
  }, [activeEntry?.taskId, teamTasks]);

  const currentSessionLabel = activeEntry
    ? formatMinutes(minutesBetween(activeEntry.timestamp, new Date().toISOString()))
    : "Sin sesion activa";

  const weekDays = getWeekDays();
  const weekTotal = getWeekWorkedMinutes();
  const weekTarget = weekDays.reduce((total, item) => total + item.target, 0);

  function handleStartTask() {
    if (!selectedTask) {
      window.alert("Selecciona una tarea antes de iniciar el fichaje.");
      return;
    }

    if (selectedTask.assigneeId && selectedTask.assigneeId !== currentUser?.id) {
      window.alert("Esta tarea esta asignada a otro miembro del equipo.");
      return;
    }

    const startedAt = new Date().toISOString();
    const activity: TaskActivity = {
      id: `task-activity-${Date.now()}`,
      type: "started",
      message: "Trabajo iniciado desde la seccion de fichaje.",
      author: currentUser?.name ?? session?.user.name ?? "Usuario Demo",
      authorId: currentUser?.id,
      createdAt: startedAt
    };

    updateTask(selectedTask.id, {
      assigneeId: currentUser?.id,
      status: "in_progress",
      activity: [...selectedTask.activity, activity]
    });

    if (currentTeam) {
      addFeedEvent({
        teamId: currentTeam.id,
        content: `Tarea en progreso: ${selectedTask.title}`,
        author: currentUser?.name ?? session?.user.name ?? "Usuario Demo",
        eventType: "system"
      });
    }

    ficharEntrada({
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      memberId: currentUser?.id,
      memberName: currentUser?.name
    });
  }

  function handleCheckoutSubmit(values: TaskCheckoutValues) {
    if (activeTask) {
      const createdAt = new Date().toISOString();
      const activity: TaskActivity = {
        id: `task-activity-${Date.now()}`,
        type: values.resolution === "done" ? "completed" : "paused",
        message:
          values.note ||
          (values.resolution === "done"
            ? "Trabajo completado desde la seccion de fichaje."
            : "Trabajo pausado para continuarlo mas tarde."),
        author: currentUser?.name ?? session?.user.name ?? "Usuario Demo",
        authorId: currentUser?.id,
        createdAt
      };

      updateTask(activeTask.id, {
        status: values.resolution,
        activity: [...activeTask.activity, activity]
      });

      if (currentTeam) {
        addFeedEvent({
          teamId: currentTeam.id,
          content:
            values.resolution === "done"
              ? `Tarea completada: ${activeTask.title}`
              : `Tarea pausada para continuar despues: ${activeTask.title}`,
          author: currentUser?.name ?? session?.user.name ?? "Usuario Demo",
          eventType: values.resolution === "done" ? "task_completed" : "system"
        });
      }
    }

    ficharSalida({
      note: values.note,
      memberId: currentUser?.id,
      memberName: currentUser?.name
    });
    setCheckoutOpen(false);
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface2 px-3 py-1 text-sm font-medium text-text-secondary">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  status === "in" ? "animate-pulse bg-state-success" : "bg-text-muted"
                )}
              />
              {status === "in" ? "Trabajando" : "Sin fichar"}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-semibold text-text-primary">Fichaje por tarea</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Gestiona tu jornada solo con tareas asignadas y revisa tu actividad reciente.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <div className="rounded-2xl border border-line bg-surface2 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Tarea activa</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {activeEntry?.taskTitle ?? "Selecciona una tarea para empezar"}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface2 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Inicio</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {activeEntry ? formatTime(activeEntry.timestamp) : "--:--:--"}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface2 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Sesion actual</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{currentSessionLabel}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            className={cn("w-full sm:w-auto sm:px-6", status === "in" && "bg-state-error hover:bg-[#b83a3a] active:bg-[#9f3232]")}
            leftIcon={status === "in" ? <LogOut size={18} /> : <PlayCircle size={18} />}
            onClick={() => (status === "in" ? setCheckoutOpen(true) : handleStartTask())}
            disabled={status === "out" && !selectedTask}
          >
            {status === "in" ? "Finalizar tarea" : "Iniciar tarea"}
          </Button>

          {status === "out" ? (
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <TimerReset size={16} />
              El fichaje solo se puede iniciar desde una tarea seleccionada.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle2 size={16} />
              Al finalizar podras indicar si la tarea queda completada o pendiente.
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <SquareStack size={18} className="text-text-secondary" />
            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary">Tus tareas para fichar</h2>
              <p className="text-sm text-text-secondary">
                Elige manualmente la tarea con la que vas a empezar. Esta vista ofrece mas contexto que el acceso rapido de Inicio.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {availableTasks.length > 0 ? (
              availableTasks.map((task) => {
                const assignee = task.assigneeId ? teamUsers.find((user) => user.id === task.assigneeId) : null;
                const latestActivity = task.activity[task.activity.length - 1];

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all",
                      getTaskCardTone(task),
                      selectedTaskId === task.id && "border-brand-primary ring-2 ring-brand-primary/20"
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-text-primary">{task.title}</p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {task.description || "Sin descripcion adicional."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs font-medium text-text-secondary">
                          {getPriorityLabel(task.priority)}
                        </span>
                        <span className="rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs font-medium text-text-secondary">
                          {getStatusLabel(task.status)}
                        </span>
                        {task.dueDate ? (
                          <span className="rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs font-medium text-text-secondary">
                            {task.dueDate}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                      <span>
                        Responsable: <span className="font-medium text-text-primary">{assignee?.name ?? "Sin asignar"}</span>
                      </span>
                      {latestActivity ? (
                        <span className="truncate">
                          Ultima nota: <span className="font-medium text-text-primary">{latestActivity.message}</span>
                        </span>
                      ) : (
                        <span>Sin seguimiento todavia</span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-line bg-surface2 px-4 py-5 text-sm text-text-secondary">
                No tienes tareas disponibles para fichar en este equipo.
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-text-secondary" />
              <div>
                <h2 className="font-heading text-xl font-semibold text-text-primary">Resumen semanal</h2>
                <p className="text-sm text-text-secondary">Balance rapido de tu semana sin sobrecargar la pantalla.</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-surface2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Acumulado</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="font-mono text-4xl font-bold text-text-primary">{formatMinutes(weekTotal)}</p>
                <p className="text-sm text-text-secondary">Objetivo semanal: {formatMinutes(weekTarget)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {weekDays.map((day) => {
                const progress = day.target > 0 ? Math.min(100, Math.round((day.worked / day.target) * 100)) : 0;
                const dayLabel = new Date(`${day.date}T00:00:00`).toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "2-digit"
                });

                return (
                  <div key={day.date} className="rounded-2xl border border-line bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold capitalize text-text-primary">{dayLabel}</p>
                        <p className="text-xs text-text-secondary">
                          {formatMinutes(day.worked)} de {formatMinutes(day.target)}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-semibold text-text-primary">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-surface2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          progress >= 100 ? "bg-state-success" : progress >= 75 ? "bg-state-warning" : "bg-brand-primary"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      <TaskCheckoutModal
        open={checkoutOpen}
        taskTitle={activeTask?.title ?? activeEntry?.taskTitle}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={handleCheckoutSubmit}
      />
    </section>
  );
}

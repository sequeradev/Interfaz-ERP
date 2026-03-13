"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, GripVertical } from "lucide-react";
import { TaskCheckoutModal, type TaskCheckoutValues } from "@/components/tasks/TaskCheckoutModal";
import { useTeamContext } from "@/context/TeamContext";
import { useWorkContext } from "@/context/WorkContext";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { resolveCurrentUser } from "@/lib/mockUsers";
import { useFichajeStore } from "@/lib/store/fichajeStore";
import type { Task, TaskActivity } from "@/lib/types";

const QUICK_DROPZONE_ID = "quick-task-dropzone";

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
        <p className="font-mono text-6xl font-bold tracking-tight text-text-muted sm:text-7xl">--:--</p>
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

function DraggableTask({
  task,
  selected,
  onSelect
}: {
  task: Task;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
        selected
          ? "border-brand-primary/40 bg-brand-primary/10"
          : "border-line bg-white hover:border-brand-primary/30 hover:bg-[#eef4f8]",
        isDragging && "opacity-70"
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical size={16} className="text-text-muted" aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">{task.title}</p>
        <p className="truncate text-xs text-text-secondary">
          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
        </p>
      </div>
    </button>
  );
}

function TaskDropZone({
  taskTitle,
  taskMeta,
  status
}: {
  taskTitle?: string | null;
  taskMeta?: string | null;
  status: "in" | "out";
}) {
  const { setNodeRef, isOver } = useDroppable({ id: QUICK_DROPZONE_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border border-dashed p-4 transition-colors",
        isOver ? "border-brand-primary bg-brand-primary/10" : "border-line bg-surface2"
      )}
    >
      <p className="text-sm font-semibold text-text-primary">
        {status === "out" ? "Suelta una tarea aqui para fichar entrada" : "Tarea activa de esta sesion"}
      </p>
      {taskTitle ? (
        <div className="mt-2 rounded-xl border border-line bg-white px-3 py-2">
          <p className="text-sm font-semibold text-text-primary">{taskTitle}</p>
          {taskMeta ? <p className="text-xs text-text-secondary">{taskMeta}</p> : null}
        </div>
      ) : (
        <p className="mt-2 text-sm text-text-secondary">Sin tarea seleccionada.</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { currentTeam } = useTeamContext();
  const { tasksByTeam, updateTask, addFeedEvent } = useWorkContext();

  const session = getSession();
  const currentUser = resolveCurrentUser(currentTeam?.id, session?.user);

  const hydrate = useFichajeStore((s) => s.hydrate);
  const status = useFichajeStore((s) => s.status);
  const ficharEntrada = useFichajeStore((s) => s.ficharEntrada);
  const ficharSalida = useFichajeStore((s) => s.ficharSalida);
  const getTodayRecords = useFichajeStore((s) => s.getTodayRecords);

  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const teamTasks = currentTeam ? tasksByTeam[currentTeam.id] ?? [] : [];
  const pendingTasks = useMemo(() => teamTasks.filter((task) => task.status !== "done"), [teamTasks]);

  const quickTasks = useMemo(() => {
    const assignedToMe = pendingTasks.filter((task) => task.assigneeId === currentUser?.id);
    const unassigned = pendingTasks.filter((task) => !task.assigneeId);
    return [...assignedToMe, ...unassigned].slice(0, 8);
  }, [currentUser?.id, pendingTasks]);

  useEffect(() => {
    if (!selectedTaskId || !quickTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(quickTasks[0]?.id ?? "");
    }
  }, [quickTasks, selectedTaskId]);

  const selectedTask = useMemo(
    () => teamTasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, teamTasks]
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

  function handleDragEnd(event: DragEndEvent) {
    if (String(event.over?.id) !== QUICK_DROPZONE_ID) {
      return;
    }

    setSelectedTaskId(String(event.active.id));
  }

  function handleQuickFichaje() {
    if (status === "out") {
      if (!selectedTask) {
        window.alert("Selecciona o arrastra una tarea antes de fichar entrada.");
        return;
      }

      if (selectedTask.assigneeId && selectedTask.assigneeId !== currentUser?.id) {
        window.alert("No puedes fichar una tarea asignada a otro miembro del equipo.");
        return;
      }

      const startedAt = new Date().toISOString();
      const startActivity: TaskActivity = {
        id: `task-activity-${Date.now()}`,
        type: "started",
        message: "Trabajo iniciado desde el panel de fichaje rapido.",
        author: currentUser?.name ?? session?.user.name ?? "Usuario Demo",
        authorId: currentUser?.id,
        createdAt: startedAt
      };

      updateTask(selectedTask.id, {
        assigneeId: currentUser?.id,
        status: "in_progress",
        activity: [...selectedTask.activity, startActivity]
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
      return;
    }

    setCheckoutOpen(true);
  }

  function handleCheckoutSubmit(values: TaskCheckoutValues) {
    if (!activeTask) {
      ficharSalida({
        note: values.note,
        memberId: currentUser?.id,
        memberName: currentUser?.name
      });
      setCheckoutOpen(false);
      return;
    }

    const finishedAt = new Date().toISOString();
    const activityMessage =
      values.note ||
      (values.resolution === "done"
        ? "Trabajo completado y fichaje cerrado."
        : "Trabajo pausado para retomarlo mas tarde.");
    const taskActivity: TaskActivity = {
      id: `task-activity-${Date.now()}`,
      type: values.resolution === "done" ? "completed" : "paused",
      message: activityMessage,
      author: currentUser?.name ?? session?.user.name ?? "Usuario Demo",
      authorId: currentUser?.id,
      createdAt: finishedAt
    };

    updateTask(activeTask.id, {
      status: values.resolution,
      activity: [...activeTask.activity, taskActivity]
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

    ficharSalida({
      note: values.note,
      memberId: currentUser?.id,
      memberName: currentUser?.name
    });
    setCheckoutOpen(false);
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Inicio</h1>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-8 shadow-soft">
        <DashClock />
      </div>

      <div
        className={`flex items-center justify-center gap-3 rounded-2xl border px-6 py-4 text-lg font-semibold ${status === "in"
          ? "border-state-success/30 bg-state-success/10 text-state-success"
          : "border-state-error/20 bg-state-error/5 text-state-error"
          }`}
      >
        <span
          className={`h-3 w-3 rounded-full ${status === "in" ? "animate-pulse bg-state-success" : "bg-state-error"}`}
        />
        {status === "in" ? "Tu estas trabajando ahora" : "Tu aun no has fichado hoy"}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-[1.35fr_minmax(0,1fr)]">
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-text-secondary">Mis tareas para fichaje rapido</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Arrastra una tarea al bloque de fichaje o haz click para seleccionarla.
            </p>

            <div className="mt-4 space-y-2">
              {quickTasks.length > 0 ? (
                quickTasks.map((task) => (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    selected={selectedTaskId === task.id}
                    onSelect={() => setSelectedTaskId(task.id)}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-line bg-surface2 px-3 py-3 text-sm text-text-secondary">
                  No hay tareas pendientes para este equipo.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-text-secondary">Fichaje por tarea</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {status === "out"
                ? "Debes entrar con una tarea seleccionada para medir tiempos por persona."
                : "Tu sesion actual ya esta vinculada a una tarea."}
            </p>

            <div className="mt-4">
              <TaskDropZone
                status={status}
                taskTitle={status === "in" ? activeEntry?.taskTitle ?? activeTask?.title : selectedTask?.title}
                taskMeta={
                  status === "in"
                    ? activeTask
                      ? activeTask.priority === "high"
                        ? "Prioridad alta"
                        : activeTask.priority === "medium"
                          ? "Prioridad media"
                          : "Prioridad baja"
                      : null
                    : selectedTask
                      ? selectedTask.priority === "high"
                        ? "Prioridad alta"
                        : selectedTask.priority === "medium"
                          ? "Prioridad media"
                          : "Prioridad baja"
                      : null
                }
              />
            </div>

            {status === "in" && activeEntry?.taskTitle ? (
              <div className="mt-3 rounded-xl border border-state-success/30 bg-state-success/10 px-3 py-2 text-sm text-state-success">
                En curso: {activeEntry.taskTitle}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleQuickFichaje}
              disabled={status === "out" && !selectedTask}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-xl font-extrabold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50",
                status === "in" ? "bg-state-error hover:opacity-90" : "bg-state-success hover:opacity-90"
              )}
            >
              <Clock size={22} />
              {status === "in" ? "Fichar salida" : "Fichar entrada con tarea"}
            </button>

            <Link
              href="/app/fichaje"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface2"
            >
              Abrir vista completa de fichaje
              <ArrowRight size={14} />
            </Link>
          </section>
        </div>
      </DndContext>

      <TaskCheckoutModal
        open={checkoutOpen}
        taskTitle={activeTask?.title ?? activeEntry?.taskTitle}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={handleCheckoutSubmit}
      />
    </div>
  );
}

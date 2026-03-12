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
import { type ElementType, useEffect, useMemo, useState } from "react";
import { ArrowRight, Briefcase, CheckSquare, Clock, GripVertical, UserCheck, UserX, Users } from "lucide-react";
import { useTeamContext } from "@/context/TeamContext";
import { useWorkContext } from "@/context/WorkContext";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { resolveCurrentUser } from "@/lib/mockUsers";
import { minutesBetween, useFichajeStore } from "@/lib/store/fichajeStore";
import type { Task } from "@/lib/types";

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

function TeamCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: ElementType;
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

function useTeamStats() {
  const days = useFichajeStore((s) => s.days);
  const myStatus = useFichajeStore((s) => s.status);
  const getWeekWorkedMinutes = useFichajeStore((s) => s.getWeekWorkedMinutes);
  const getTodayWorkedMinutes = useFichajeStore((s) => s.getTodayWorkedMinutes);
  const TOTAL_TEAM = 5;

  const today = new Date().toISOString().slice(0, 10);
  const todayDay = days.find((d) => d.date === today);
  const myFichadoHoy = todayDay?.records.some((r) => r.type === "in") ?? false;

  const otrosActivos = myStatus === "in" ? 3 : 2;
  const trabajandoAhora = myStatus === "in" ? otrosActivos : otrosActivos;
  const faltanFichar = TOTAL_TEAM - (myFichadoHoy ? otrosActivos + 1 : otrosActivos);

  const todayMins = getTodayWorkedMinutes();
  const horasEquipo = `${Math.floor(todayMins / 60)}h ${String(todayMins % 60).padStart(2, "0")}m`;
  const weekMins = getWeekWorkedMinutes();
  const horasSemana = `${Math.floor(weekMins / 60)}h ${String(weekMins % 60).padStart(2, "0")}m`;

  return { trabajandoAhora, faltanFichar, horasEquipo, horasSemana, TOTAL_TEAM };
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
  const { trabajandoAhora, faltanFichar, horasEquipo, horasSemana, TOTAL_TEAM } = useTeamStats();
  const { currentTeam } = useTeamContext();
  const { tasksByTeam, projects } = useWorkContext();

  const session = getSession();
  const currentUser = resolveCurrentUser(currentTeam?.id, session?.user);

  const hydrate = useFichajeStore((s) => s.hydrate);
  const status = useFichajeStore((s) => s.status);
  const ficharEntrada = useFichajeStore((s) => s.ficharEntrada);
  const ficharSalida = useFichajeStore((s) => s.ficharSalida);
  const getTodayRecords = useFichajeStore((s) => s.getTodayRecords);

  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const teamTasks = currentTeam ? tasksByTeam[currentTeam.id] ?? [] : [];
  const pendingTasks = useMemo(() => teamTasks.filter((task) => task.status !== "done"), [teamTasks]);

  const quickTasks = useMemo(() => {
    const assignedToMe = pendingTasks.filter((task) => task.assigneeId === currentUser?.id);
    const unassigned = pendingTasks.filter((task) => !task.assigneeId);
    const all = [...assignedToMe, ...unassigned, ...pendingTasks];

    const seen = new Set<string>();
    const unique = all.filter((task) => {
      if (seen.has(task.id)) {
        return false;
      }
      seen.add(task.id);
      return true;
    });

    return unique.slice(0, 8);
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

  const workedByTaskToday = useMemo(() => {
    const sorted = [...todayRecords].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const totals = new Map<string, { taskTitle: string; minutes: number }>();
    let lastIn: (typeof sorted)[number] | null = null;

    for (const record of sorted) {
      if (record.type === "in") {
        lastIn = record;
        continue;
      }

      if (record.type === "out" && lastIn) {
        const taskKey = lastIn.taskId ?? "sin-tarea";
        const taskTitle = lastIn.taskTitle ?? "Sin tarea";
        const minutes = minutesBetween(lastIn.timestamp, record.timestamp);
        const previous = totals.get(taskKey);
        totals.set(taskKey, {
          taskTitle,
          minutes: (previous?.minutes ?? 0) + Math.max(0, minutes)
        });
        lastIn = null;
      }
    }

    if (lastIn) {
      const taskKey = lastIn.taskId ?? "sin-tarea";
      const taskTitle = lastIn.taskTitle ?? "Sin tarea";
      const minutes = minutesBetween(lastIn.timestamp, new Date().toISOString());
      const previous = totals.get(taskKey);
      totals.set(taskKey, {
        taskTitle,
        minutes: (previous?.minutes ?? 0) + Math.max(0, minutes)
      });
    }

    return [...totals.values()].sort((a, b) => b.minutes - a.minutes);
  }, [todayRecords]);

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

      ficharEntrada({
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        memberId: currentUser?.id,
        memberName: currentUser?.name
      });
      return;
    }

    ficharSalida({
      memberId: currentUser?.id,
      memberName: currentUser?.name
    });
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Inicio</h1>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-8 shadow-soft">
        <DashClock />
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TeamCard
          icon={Briefcase}
          iconBg="bg-brand-secondary/10"
          iconColor="text-brand-secondary"
          value={projects.length}
          label="Proyectos activos"
        />
        <TeamCard
          icon={CheckSquare}
          iconBg="bg-state-warning/10"
          iconColor="text-state-warning"
          value={pendingTasks.length}
          label="Tareas pendientes"
        />
        <TeamCard
          icon={Clock}
          iconBg="bg-state-info/10"
          iconColor="text-state-info"
          value={horasSemana}
          label="Horas esta semana"
        />
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
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-xl font-extrabold text-white transition-all",
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

      {workedByTaskToday.length > 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-text-secondary">Tiempo de hoy por tarea</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {workedByTaskToday.map((item) => (
              <span
                key={item.taskTitle}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface2 px-3 py-1.5 text-sm"
              >
                <span className="font-medium text-text-primary">{item.taskTitle}</span>
                <span className="text-text-secondary">
                  {Math.floor(item.minutes / 60)}h {String(item.minutes % 60).padStart(2, "0")}m
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-secondary">
          <Users size={15} />
          Equipo ({TOTAL_TEAM} personas)
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "Ana G.", active: true },
            { name: "Carlos M.", active: true },
            { name: "Laura P.", active: status === "in" },
            { name: "Tu", active: status === "in" },
            { name: "Ruben T.", active: false },
          ].map((member) => (
            <div
              key={member.name}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${member.active
                ? "border-state-success/30 bg-state-success/8 text-state-success"
                : "border-line bg-surface2 text-text-muted"
                }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${member.active ? "animate-pulse bg-state-success" : "bg-text-muted"}`}
              />
              {member.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

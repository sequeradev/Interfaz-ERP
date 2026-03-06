"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Task, TaskPriority, TaskStatus, User } from "@/lib/types";

type TaskDrawerProps = {
  open: boolean;
  task: Task | null;
  users: User[];
  canAssign?: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
};

type DrawerForm = {
  title: string;
  description: string;
  assigneeId?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
};

export function TaskDrawer({ open, task, users, canAssign = true, onClose, onSave, onDelete }: TaskDrawerProps) {
  const [form, setForm] = useState<DrawerForm>({
    title: "",
    description: "",
    assigneeId: "",
    dueDate: "",
    priority: "medium",
    status: "todo"
  });
  const [titleError, setTitleError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!task) {
      return;
    }

    setForm({
      title: task.title,
      description: task.description ?? "",
      assigneeId: task.assigneeId ?? "",
      dueDate: task.dueDate ?? "",
      priority: task.priority,
      status: task.status
    });
    setTitleError(null);
    setConfirmDelete(false);
  }, [task]);

  if (!open || !task) {
    return null;
  }

  function handleSave() {
    if (!task) {
      return;
    }

    const normalizedTitle = form.title.trim();
    if (normalizedTitle.length < 2) {
      setTitleError("El titulo debe tener al menos 2 caracteres.");
      return;
    }

    onSave(task.id, {
      title: normalizedTitle,
      description: form.description,
      assigneeId: canAssign ? form.assigneeId || undefined : task.assigneeId,
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      status: form.status
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1f2933]/30" role="presentation" onMouseDown={onClose}>
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-line bg-surface p-6 shadow-lift"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="task-drawer-title" className="font-heading text-2xl font-semibold text-text-primary">
            Detalle de tarea
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-[#f3f7fa] hover:text-text-primary"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4">
          <Input
            id="drawer-title"
            label="Titulo"
            value={form.title}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, title: event.target.value }));
              setTitleError(null);
            }}
            error={titleError ?? undefined}
          />

          <div className="space-y-1.5">
            <label htmlFor="drawer-description" className="block text-sm font-medium text-text-primary">
              Descripcion
            </label>
            <textarea
              id="drawer-description"
              value={form.description}
              onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
              rows={5}
              className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="drawer-assignee" className="block text-sm font-medium text-text-primary">
                Responsable
              </label>
              {canAssign ? (
                <select
                  id="drawer-assignee"
                  value={form.assigneeId ?? ""}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, assigneeId: event.target.value || undefined }))
                  }
                  className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
                >
                  <option value="">Sin asignar</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  id="drawer-assignee"
                  className="flex h-11 items-center rounded-xl border border-line bg-[#f3f7fa] px-3 text-sm text-text-secondary"
                >
                  Solo manager/admin puede cambiar responsable.
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drawer-due-date" className="block text-sm font-medium text-text-primary">
                Fecha limite
              </label>
              <input
                id="drawer-due-date"
                type="date"
                value={form.dueDate ?? ""}
                onChange={(event) => setForm((previous) => ({ ...previous, dueDate: event.target.value }))}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="drawer-priority" className="block text-sm font-medium text-text-primary">
                Prioridad
              </label>
              <select
                id="drawer-priority"
                value={form.priority}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, priority: event.target.value as TaskPriority }))
                }
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drawer-status" className="block text-sm font-medium text-text-primary">
                Estado
              </label>
              <select
                id="drawer-status"
                value={form.status}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, status: event.target.value as TaskStatus }))
                }
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
              >
                <option value="todo">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Completado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button type="button" variant="secondary" className="w-auto px-5" onClick={() => setConfirmDelete(true)}>
            Eliminar
          </Button>
          <Button type="button" className="w-auto px-6" onClick={handleSave}>
            Guardar
          </Button>
        </div>

        {confirmDelete ? (
          <div className="mt-5 rounded-xl border border-state-error/30 bg-red-50 p-4">
            <p className="text-sm font-medium text-state-error">Eliminar esta tarea de forma permanente?</p>
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="secondary" className="w-auto px-4" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="w-auto bg-state-error px-4 hover:bg-[#b83a3a] active:bg-[#9f3232]"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
              >
                Confirmar eliminacion
              </Button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

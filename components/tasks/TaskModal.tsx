"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaskPriority, TaskStatus, User } from "@/lib/types";

export type TaskFormValues = {
  title: string;
  description: string;
  assigneeId?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
};

type TaskModalProps = {
  open: boolean;
  title?: string;
  submitLabel?: string;
  canAssign?: boolean;
  users: User[];
  initialValues?: Partial<TaskFormValues>;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
};

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  assigneeId: "",
  dueDate: "",
  priority: "medium",
  status: "todo"
};

export function TaskModal({
  open,
  title = "Crear tarea",
  submitLabel = "Crear tarea",
  canAssign = true,
  users,
  initialValues,
  onClose,
  onSubmit
}: TaskModalProps) {
  const [formValues, setFormValues] = useState<TaskFormValues>(defaultValues);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues({
      ...defaultValues,
      ...initialValues
    });
    setTitleError(null);
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = formValues.title.trim();

    if (normalizedTitle.length < 2) {
      setTitleError("El titulo debe tener al menos 2 caracteres.");
      return;
    }

    onSubmit({
      ...formValues,
      assigneeId: canAssign ? formValues.assigneeId : initialValues?.assigneeId || undefined,
      title: normalizedTitle
    });
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2933]/40 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-line bg-surface p-6 shadow-lift"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="task-modal-title" className="font-heading text-2xl font-semibold text-text-primary">
          {title}
        </h2>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            id="task-title"
            label="Titulo"
            value={formValues.title}
            onChange={(event) => {
              setFormValues((previous) => ({ ...previous, title: event.target.value }));
              setTitleError(null);
            }}
            error={titleError ?? undefined}
            placeholder="Escribe un titulo claro para la tarea"
          />

          <div className="space-y-1.5">
            <label htmlFor="task-description" className="block text-sm font-medium text-text-primary">
              Descripcion
            </label>
            <textarea
              id="task-description"
              rows={4}
              value={formValues.description}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, description: event.target.value }))
              }
              placeholder="Detalles opcionales de la tarea"
              className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm transition-colors placeholder:text-text-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="task-assignee" className="block text-sm font-medium text-text-primary">
                Responsable
              </label>
              {canAssign ? (
                <select
                  id="task-assignee"
                  value={formValues.assigneeId ?? ""}
                  onChange={(event) =>
                    setFormValues((previous) => ({ ...previous, assigneeId: event.target.value || undefined }))
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
                  id="task-assignee"
                  className="flex h-11 items-center rounded-xl border border-line bg-[#f3f7fa] px-3 text-sm text-text-secondary"
                >
                  El manager/admin asignara el responsable.
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-due-date" className="block text-sm font-medium text-text-primary">
                Fecha limite
              </label>
              <input
                id="task-due-date"
                type="date"
                value={formValues.dueDate ?? ""}
                onChange={(event) =>
                  setFormValues((previous) => ({ ...previous, dueDate: event.target.value || undefined }))
                }
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="task-priority" className="block text-sm font-medium text-text-primary">
                Prioridad
              </label>
              <select
                id="task-priority"
                value={formValues.priority}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    priority: event.target.value as TaskPriority
                  }))
                }
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-status" className="block text-sm font-medium text-text-primary">
                Estado
              </label>
              <select
                id="task-status"
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((previous) => ({ ...previous, status: event.target.value as TaskStatus }))
                }
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
              >
                <option value="todo">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Completado</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" className="w-auto px-5" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="w-auto px-5">
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

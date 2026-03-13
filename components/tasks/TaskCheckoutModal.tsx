"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export type TaskCheckoutValues = {
  resolution: "done" | "todo";
  note: string;
};

type TaskCheckoutModalProps = {
  open: boolean;
  taskTitle?: string | null;
  onClose: () => void;
  onSubmit: (values: TaskCheckoutValues) => void;
};

export function TaskCheckoutModal({ open, taskTitle, onClose, onSubmit }: TaskCheckoutModalProps) {
  const [resolution, setResolution] = useState<"done" | "todo">("todo");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setResolution("todo");
    setNote("");
  }, [open]);

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
    onSubmit({
      resolution,
      note: note.trim()
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
        className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-lift"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-checkout-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="task-checkout-title" className="font-heading text-2xl font-semibold text-text-primary">
          Finalizar fichaje
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {taskTitle ? `Indica como queda la tarea "${taskTitle}".` : "Indica como queda la tarea activa."}
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-primary">Estado al salir</p>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3">
              <input
                type="radio"
                name="task-resolution"
                value="todo"
                checked={resolution === "todo"}
                onChange={() => setResolution("todo")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-text-primary">Seguir mas tarde</p>
                <p className="text-sm text-text-secondary">La tarea volvera a pendiente para retomarla despues.</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3">
              <input
                type="radio"
                name="task-resolution"
                value="done"
                checked={resolution === "done"}
                onChange={() => setResolution("done")}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-text-primary">Completamente finalizada</p>
                <p className="text-sm text-text-secondary">La tarea pasara a completada para todo el equipo.</p>
              </div>
            </label>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-checkout-note" className="block text-sm font-medium text-text-primary">
              Indicacion para el equipo
            </label>
            <textarea
              id="task-checkout-note"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Anade contexto sobre lo realizado, bloqueos o siguiente paso"
              className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm placeholder:text-text-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" className="w-auto px-5" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="w-auto px-5">
              Guardar salida
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiMercado, ApiMercadoCreate, ApiMercadoUpdate } from "@/lib/api/types";

type MercadoModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (input: ApiMercadoCreate | ApiMercadoUpdate) => void;
  mercado?: ApiMercado | null;
};

export function MercadoModal({ open, onClose, onSave, mercado }: MercadoModalProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && mercado) {
      setNombre(mercado.nombre);
      setDescripcion(mercado.descripcion ?? "");
    } else if (open) {
      setNombre("");
      setDescripcion("");
    }
    setError(null);
  }, [open, mercado]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2933]/35 p-4" role="presentation" onMouseDown={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-lift" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-5">
          {mercado ? "Editar mercado" : "Crear mercado"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input id="mercado-nombre" label="Nombre" value={nombre} onChange={(e) => { setNombre(e.target.value); setError(null); }} error={error ?? undefined} placeholder="Mercado Nacional" />
          <div className="space-y-1.5">
            <label htmlFor="mercado-desc" className="block text-sm font-medium text-text-primary">Descripcion</label>
            <textarea id="mercado-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} placeholder="Descripcion del mercado" className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm transition-colors placeholder:text-text-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" className="w-auto px-5" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="w-auto px-5">{mercado ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

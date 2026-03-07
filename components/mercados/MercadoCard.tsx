"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ApiMercado } from "@/lib/api/types";

type MercadoCardProps = {
  mercado: ApiMercado;
  onEdit: (mercado: ApiMercado) => void;
  onDelete: (mercadoId: string) => void;
};

export function MercadoCard({ mercado, onEdit, onDelete }: MercadoCardProps) {
  return (
    <Card className="space-y-3 p-6">
      <div className="flex items-start justify-between">
        <h2 className="font-heading text-xl font-semibold text-text-primary">{mercado.nombre}</h2>
        <div className="flex gap-1">
          <button type="button" onClick={() => onEdit(mercado)} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface2 hover:text-brand-primary transition-colors" aria-label="Editar">
            <Pencil size={14} />
          </button>
          <button type="button" onClick={() => onDelete(mercado.mercado_id)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-50 hover:text-state-error transition-colors" aria-label="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-sm text-text-secondary">{mercado.descripcion || "Sin descripcion."}</p>
    </Card>
  );
}

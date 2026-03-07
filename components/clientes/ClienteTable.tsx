"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { ApiCliente } from "@/lib/api/types";

type ClienteTableProps = {
  clientes: ApiCliente[];
  onEdit: (cliente: ApiCliente) => void;
  onDelete: (clienteId: string) => void;
};

export function ClienteTable({ clientes, onEdit, onDelete }: ClienteTableProps) {
  if (clientes.length === 0) {
    return <p className="py-8 text-center text-text-secondary">No hay clientes registrados.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-surface2">
            <th className="px-4 py-3 text-left font-medium text-text-secondary">NIF</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Email</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Telefono</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Ciudad</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Activo</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.cliente_id} className="border-b border-line last:border-b-0 hover:bg-surface2/50 transition-colors">
              <td className="px-4 py-3 font-mono text-text-primary">{c.nif}</td>
              <td className="px-4 py-3 text-text-primary">{c.nombre_comercial ?? "—"}</td>
              <td className="px-4 py-3 text-text-secondary">{c.email ?? "—"}</td>
              <td className="px-4 py-3 text-text-secondary">{c.telefono ?? "—"}</td>
              <td className="px-4 py-3 text-text-secondary">{c.ciudad ?? "—"}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${c.activo ? "bg-green-50 text-state-success" : "bg-red-50 text-state-error"}`}>
                  {c.activo ? "Si" : "No"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-1">
                  <button type="button" onClick={() => onEdit(c)} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface2 hover:text-brand-primary transition-colors" aria-label="Editar">
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => onDelete(c.cliente_id)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-50 hover:text-state-error transition-colors" aria-label="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

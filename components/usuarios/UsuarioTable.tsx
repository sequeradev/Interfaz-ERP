"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { ApiUsuario } from "@/lib/api/types";

type UsuarioTableProps = {
  usuarios: ApiUsuario[];
  onEdit: (usuario: ApiUsuario) => void;
  onDelete: (usuarioId: string) => void;
};

export function UsuarioTable({ usuarios, onEdit, onDelete }: UsuarioTableProps) {
  if (usuarios.length === 0) {
    return <p className="py-8 text-center text-text-secondary">No hay usuarios registrados.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-surface2">
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Email</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Rol</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Activo</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.usuario_id} className="border-b border-line last:border-b-0 hover:bg-surface2/50 transition-colors">
              <td className="px-4 py-3 text-text-primary">{u.nombre} {u.apellidos}</td>
              <td className="px-4 py-3 font-mono text-text-secondary">{u.email}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${u.rol === "admin" ? "bg-blue-50 text-state-info" : "bg-[#f3f7fa] text-text-secondary"}`}>
                  {u.rol === "admin" ? "Admin" : "Usuario"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${u.activo !== false ? "bg-green-50 text-state-success" : "bg-red-50 text-state-error"}`}>
                  {u.activo !== false ? "Si" : "No"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-1">
                  <button type="button" onClick={() => onEdit(u)} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface2 hover:text-brand-primary transition-colors" aria-label="Editar">
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => onDelete(u.usuario_id)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-50 hover:text-state-error transition-colors" aria-label="Eliminar">
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

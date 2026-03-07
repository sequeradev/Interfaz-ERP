"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { LogDetailRow } from "@/components/logs/LogDetailRow";
import type { ApiLog } from "@/lib/api/types";

type LogTableProps = {
  logs: ApiLog[];
};

const levelColors: Record<string, string> = {
  info: "bg-blue-50 text-state-info",
  warning: "bg-yellow-50 text-yellow-700",
  error: "bg-red-50 text-state-error",
  debug: "bg-gray-50 text-text-secondary"
};

export function LogTable({ logs }: LogTableProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(logId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) next.delete(logId);
      else next.add(logId);
      return next;
    });
  }

  if (logs.length === 0) {
    return <p className="py-8 text-center text-text-secondary">No hay logs disponibles.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-surface2">
            <th className="w-8 px-2 py-3" />
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Fecha</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Entidad</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Accion</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Nivel</th>
            <th className="px-4 py-3 text-left font-medium text-text-secondary">Mensaje</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const isOpen = expanded.has(log.log_id);
            const hasDetails = log.old_data || log.new_data;

            return (
              <Fragment key={log.log_id}>
                <tr className="border-b border-line last:border-b-0">
                  <td className="px-2 py-3">
                    {hasDetails && (
                      <button type="button" onClick={() => toggle(log.log_id)} className="rounded p-0.5 text-text-secondary hover:text-text-primary" aria-label={isOpen ? "Cerrar detalles" : "Ver detalles"}>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary whitespace-nowrap">
                    {log.created_at ? new Date(log.created_at).toLocaleString("es-ES") : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{log.entity}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ""}</td>
                  <td className="px-4 py-3 text-text-primary">{log.action}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${levelColors[log.level] ?? "bg-gray-50 text-text-secondary"}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-xs truncate">{log.message ?? "—"}</td>
                </tr>
                {isOpen && (
                  <tr className="border-b border-line">
                    <td colSpan={6} className="px-4 pb-3">
                      <LogDetailRow label="Datos anteriores" data={log.old_data} />
                      <LogDetailRow label="Datos nuevos" data={log.new_data} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

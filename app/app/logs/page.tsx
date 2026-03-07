"use client";

import { useCallback, useEffect, useState } from "react";
import { LogTable } from "@/components/logs/LogTable";
import { Pagination } from "@/components/ui/Pagination";
import { getSession } from "@/lib/auth";
import { apiListLogs } from "@/lib/api/services";
import type { ApiLog } from "@/lib/api/types";
import { usePagination } from "@/lib/hooks/usePagination";

export default function LogsPage() {
  const session = getSession();
  const isAdmin = session?.user.role === "admin";
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { page, skip, limit, hasMore, nextPage, prevPage, updateHasMore } = usePagination({ pageSize: 50 });

  const fetchLogs = useCallback(async () => {
    if (!session?.token || session.token === "mock") return;
    setLoading(true);
    try {
      const data = await apiListLogs(session.token, { skip, limit });
      setLogs(data);
      updateHasMore(data.length);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [session?.token, skip, limit, updateHasMore]);

  useEffect(() => {
    if (isAdmin) fetchLogs();
  }, [isAdmin, fetchLogs]);

  if (!isAdmin) {
    return (
      <section className="space-y-6">
        <h1 className="font-heading text-4xl font-semibold text-text-primary">Logs</h1>
        <p className="text-base text-text-secondary">No tienes permisos para acceder a esta seccion.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-4xl font-semibold text-text-primary">Logs del sistema</h1>
        <p className="text-base text-text-secondary">Registro de actividad del sistema (solo lectura).</p>
      </header>

      {loading ? (
        <p className="py-8 text-center text-text-secondary">Cargando logs...</p>
      ) : (
        <>
          <LogTable logs={logs} />
          <Pagination page={page} hasMore={hasMore} onPrev={prevPage} onNext={nextPage} />
        </>
      )}
    </section>
  );
}

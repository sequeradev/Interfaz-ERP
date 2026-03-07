"use client";

import { useEffect, useState } from "react";
import { MercadoCard } from "@/components/mercados/MercadoCard";
import { MercadoModal } from "@/components/mercados/MercadoModal";
import { Button } from "@/components/ui/button";
import type { ApiMercado, ApiMercadoCreate, ApiMercadoUpdate } from "@/lib/api/types";
import { useMercadosStore } from "@/lib/store/mercadosStore";

export default function MercadosPage() {
  const { mercados, loading, hydrate, createMercado, updateMercado, deleteMercado } = useMercadosStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiMercado | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  function handleSave(input: ApiMercadoCreate | ApiMercadoUpdate) {
    if (editing) {
      updateMercado(editing.mercado_id, input as ApiMercadoUpdate);
    } else {
      createMercado(input as ApiMercadoCreate);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleEdit(mercado: ApiMercado) {
    setEditing(mercado);
    setModalOpen(true);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-semibold text-text-primary">Mercados</h1>
          <p className="text-base text-text-secondary">Gestion de mercados del sistema.</p>
        </div>
        <Button type="button" className="w-auto px-5" onClick={() => { setEditing(null); setModalOpen(true); }}>
          + Crear mercado
        </Button>
      </header>

      {loading ? (
        <p className="py-8 text-center text-text-secondary">Cargando mercados...</p>
      ) : mercados.length === 0 ? (
        <p className="py-8 text-center text-text-secondary">No hay mercados registrados.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mercados.map((m) => (
            <MercadoCard key={m.mercado_id} mercado={m} onEdit={handleEdit} onDelete={deleteMercado} />
          ))}
        </div>
      )}

      <MercadoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        mercado={editing}
      />
    </section>
  );
}

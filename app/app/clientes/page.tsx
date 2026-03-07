"use client";

import { useEffect, useState } from "react";
import { ClienteModal } from "@/components/clientes/ClienteModal";
import { ClienteTable } from "@/components/clientes/ClienteTable";
import { Button } from "@/components/ui/button";
import type { ApiCliente, ApiClienteCreate, ApiClienteUpdate } from "@/lib/api/types";
import { useClientesStore } from "@/lib/store/clientesStore";

export default function ClientesPage() {
  const { clientes, loading, hydrate, createCliente, updateCliente, deleteCliente } = useClientesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCliente | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  function handleSave(input: ApiClienteCreate | ApiClienteUpdate) {
    if (editing) {
      updateCliente(editing.cliente_id, input as ApiClienteUpdate);
    } else {
      createCliente(input as ApiClienteCreate);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleEdit(cliente: ApiCliente) {
    setEditing(cliente);
    setModalOpen(true);
  }

  function handleDelete(clienteId: string) {
    setConfirmDelete(clienteId);
  }

  function confirmDeleteAction() {
    if (confirmDelete) {
      deleteCliente(confirmDelete);
      setConfirmDelete(null);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-semibold text-text-primary">Clientes</h1>
          <p className="text-base text-text-secondary">Gestion de clientes del sistema.</p>
        </div>
        <Button type="button" className="w-auto px-5" onClick={() => { setEditing(null); setModalOpen(true); }}>
          + Crear cliente
        </Button>
      </header>

      {loading ? (
        <p className="py-8 text-center text-text-secondary">Cargando clientes...</p>
      ) : (
        <ClienteTable clientes={clientes} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <ClienteModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        cliente={editing}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2933]/35 p-4" role="presentation" onMouseDown={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-lift" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">Eliminar cliente</h3>
            <p className="text-sm text-text-secondary mb-4">Esta accion no se puede deshacer. El cliente sera eliminado permanentemente.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" className="w-auto px-5" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button type="button" className="w-auto px-5 bg-state-error hover:bg-red-700" onClick={confirmDeleteAction}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

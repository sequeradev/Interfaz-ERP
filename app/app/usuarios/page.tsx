"use client";

import { useEffect, useState } from "react";
import { UsuarioModal } from "@/components/usuarios/UsuarioModal";
import { UsuarioTable } from "@/components/usuarios/UsuarioTable";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import type { ApiUsuario, ApiUsuarioCreate, ApiUsuarioUpdate } from "@/lib/api/types";
import { useUsuariosStore } from "@/lib/store/usuariosStore";

export default function UsuariosPage() {
  const session = getSession();
  const isAdmin = session?.user.role === "admin";
  const { usuarios, loading, hydrate, createUsuario, updateUsuario, deleteUsuario } = useUsuariosStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiUsuario | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isAdmin) {
    return (
      <section className="space-y-6">
        <h1 className="font-heading text-4xl font-semibold text-text-primary">Usuarios</h1>
        <p className="text-base text-text-secondary">No tienes permisos para acceder a esta seccion.</p>
      </section>
    );
  }

  function handleSave(input: ApiUsuarioCreate | ApiUsuarioUpdate) {
    if (editing) {
      updateUsuario(editing.usuario_id, input as ApiUsuarioUpdate);
    } else {
      createUsuario(input as ApiUsuarioCreate);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleEdit(usuario: ApiUsuario) {
    setEditing(usuario);
    setModalOpen(true);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-semibold text-text-primary">Usuarios</h1>
          <p className="text-base text-text-secondary">Administracion de usuarios del sistema.</p>
        </div>
        <Button type="button" className="w-auto px-5" onClick={() => { setEditing(null); setModalOpen(true); }}>
          + Crear usuario
        </Button>
      </header>

      {loading ? (
        <p className="py-8 text-center text-text-secondary">Cargando usuarios...</p>
      ) : (
        <UsuarioTable usuarios={usuarios} onEdit={handleEdit} onDelete={deleteUsuario} />
      )}

      <UsuarioModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        usuario={editing}
      />
    </section>
  );
}

"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CreateTeamModal } from "@/components/teams/create-team-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTeamContext } from "@/context/TeamContext";
import { cn } from "@/lib/cn";
import type { Team, TeamRole } from "@/lib/types";

const roleStyles: Record<TeamRole, string> = {
  admin: "border-state-success/30 bg-green-50 text-state-success",
  manager: "border-state-info/30 bg-blue-50 text-state-info",
  member: "border-line bg-[#f3f7fa] text-text-secondary",
  viewer: "border-slate-300 bg-slate-100 text-slate-700"
};

function formatRole(role: TeamRole): string {
  const labels: Record<TeamRole, string> = {
    admin: "Administrador",
    manager: "Gestor",
    member: "Miembro",
    viewer: "Lector"
  };
  return labels[role];
}

function formatMembers(memberCount: number): string {
  return `${memberCount} ${memberCount === 1 ? "miembro" : "miembros"}`;
}

export default function TeamsPage() {
  const { teams, addTeam, setCurrentTeam, updateTeam, deleteTeam } = useTeamContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleCreateTeam(input: { name: string; description: string }) {
    const team = addTeam(input);
    setCurrentTeam(team);
    setCreateOpen(false);
  }

  function openEdit(team: Team) {
    setEditingTeam(team);
    setEditName(team.name);
    setEditDesc(team.description);
  }

  function handleSaveEdit() {
    if (editingTeam) {
      updateTeam(editingTeam.id, { name: editName, description: editDesc });
      setEditingTeam(null);
    }
  }

  function handleConfirmDelete() {
    if (confirmDelete) {
      deleteTeam(confirmDelete);
      setConfirmDelete(null);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-semibold text-text-primary">Equipos</h1>
          <p className="text-base text-text-secondary">
            Gestiona propiedad de equipos y visibilidad de roles en todos los modulos del ERP.
          </p>
        </div>

        <Button type="button" className="w-auto px-5" onClick={() => setCreateOpen(true)}>
          + Crear equipo
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="font-heading text-xl font-semibold text-text-primary">{team.name}</h2>
                <p className="text-sm text-text-secondary">{team.description}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => openEdit(team)} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface2 hover:text-brand-primary transition-colors" aria-label="Editar equipo">
                  <Pencil size={14} />
                </button>
                <button type="button" onClick={() => setConfirmDelete(team.id)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-50 hover:text-state-error transition-colors" aria-label="Eliminar equipo">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-text-secondary">Rol:</span>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                    roleStyles[team.role]
                  )}
                >
                  {formatRole(team.role)}
                </span>
              </p>
              <p className="text-text-secondary">Miembros: {formatMembers(team.memberCount)}</p>
            </div>

            <Button type="button" variant="secondary" className="w-auto px-5" onClick={() => setCurrentTeam(team)}>
              Ver equipo
            </Button>
          </Card>
        ))}
      </div>

      <CreateTeamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateTeam}
      />

      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2933]/35 p-4" role="presentation" onMouseDown={() => setEditingTeam(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-lift" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-2xl font-semibold text-text-primary mb-5">Editar equipo</h2>
            <div className="space-y-4">
              <Input id="edit-team-name" label="Nombre del equipo" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <div className="space-y-1.5">
                <label htmlFor="edit-team-desc" className="block text-sm font-medium text-text-primary">Descripcion</label>
                <textarea id="edit-team-desc" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm transition-colors placeholder:text-text-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" className="w-auto px-5" onClick={() => setEditingTeam(null)}>Cancelar</Button>
                <Button type="button" className="w-auto px-5" onClick={handleSaveEdit}>Guardar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2933]/35 p-4" role="presentation" onMouseDown={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-lift" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">Eliminar equipo</h3>
            <p className="text-sm text-text-secondary mb-4">Esta accion no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" className="w-auto px-5" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button type="button" className="w-auto px-5 bg-state-error hover:bg-red-700" onClick={handleConfirmDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

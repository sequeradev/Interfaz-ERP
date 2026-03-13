"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTeamContext } from "@/context/TeamContext";
import { useWorkContext } from "@/context/WorkContext";
import { getSession } from "@/lib/auth";
import type { ApiProyecto, ApiProyectoCreate, ApiProyectoUpdate } from "@/lib/api/types";
import type { Team } from "@/lib/types";

function isPrincipalAdmin(role?: string): boolean {
  const normalized = (role || "").toLowerCase();
  return normalized.includes("admin") || normalized.includes("owner") || normalized.includes("principal");
}

function canLeadTeam(team: Team): boolean {
  return team.role === "manager" || team.role === "admin";
}

function isProjectInProgress(project: ApiProyecto): boolean {
  if (!project.fecha_fin) return true;
  const end = new Date(project.fecha_fin);
  if (Number.isNaN(end.getTime())) return true;
  end.setHours(23, 59, 59, 999);
  return end.getTime() >= Date.now();
}

function formatDate(value?: string | null): string {
  if (!value) return "No definida";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No definida";
  return date.toLocaleDateString("es-ES");
}

type ProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (input: ApiProyectoCreate | ApiProyectoUpdate) => void;
  teams: Team[];
  isPrincipal: boolean;
  project?: ApiProyecto | null;
};

function ProjectModal({ open, onClose, onSave, teams, isPrincipal, project }: ProjectModalProps) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCodigo(project?.codigo ?? "");
    setNombre(project?.nombre ?? "");
    setDescripcion(project?.descripcion ?? "");
    setEquipoId(project?.equipo_id ?? "");
    setFechaInicio(project?.fecha_inicio?.slice(0, 10) ?? "");
    setFechaFin(project?.fecha_fin?.slice(0, 10) ?? "");
    setError(null);
  }, [open, project]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!project && !codigo.trim()) {
      setError("El codigo es obligatorio.");
      return;
    }

    if (!isPrincipal && !equipoId) {
      setError("Debes seleccionar un equipo.");
      return;
    }

    onSave({
      ...(project ? {} : { codigo: codigo.trim() }),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      equipo_id: equipoId || undefined,
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2933]/35 p-4" role="presentation" onMouseDown={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-line bg-surface p-6 shadow-lift" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="mb-5 font-heading text-2xl font-semibold text-text-primary">
          {project ? "Editar proyecto" : "Crear proyecto"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {!project ? (
            <Input
              id="proyecto-codigo"
              label="Codigo"
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value);
                setError(null);
              }}
              placeholder="PROJ-001"
            />
          ) : null}

          <Input
            id="proyecto-nombre"
            label="Nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setError(null);
            }}
            error={error ?? undefined}
            placeholder="Nuevo ERP Comercial"
          />

          <div className="space-y-1.5">
            <label htmlFor="proyecto-desc" className="block text-sm font-medium text-text-primary">Descripcion</label>
            <textarea
              id="proyecto-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Objetivo y alcance del proyecto"
              className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm transition-colors placeholder:text-text-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="proyecto-equipo" className="block text-sm font-medium text-text-primary">Equipo</label>
            <select
              id="proyecto-equipo"
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
            >
              <option value="">Sin equipo</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="proyecto-inicio" className="block text-sm font-medium text-text-primary">Fecha inicio</label>
              <input
                id="proyecto-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="proyecto-fin" className="block text-sm font-medium text-text-primary">Fecha fin</label>
              <input
                id="proyecto-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base text-text-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-info focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" className="w-auto px-5" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="w-auto px-5">{project ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProyectosPage() {
  const session = getSession();
  const { teams } = useTeamContext();
  const { projects, createProject, updateProject, deleteProject } = useWorkContext();

  const principalAdmin = isPrincipalAdmin(session?.user.role);

  const memberTeamIds = useMemo(() => new Set(teams.map((team) => team.id)), [teams]);

  const visibleProjects = useMemo(
    () =>
      projects
        .filter((project) => isProjectInProgress(project))
        .filter((project) => principalAdmin || (project.equipo_id ? memberTeamIds.has(project.equipo_id) : false)),
    [memberTeamIds, principalAdmin, projects]
  );

  const manageableTeamIds = useMemo(
    () => new Set(teams.filter((team) => canLeadTeam(team)).map((team) => team.id)),
    [teams]
  );

  const canCreate = principalAdmin || manageableTeamIds.size > 0;

  const creatableTeams = useMemo(
    () => (principalAdmin ? teams : teams.filter((team) => manageableTeamIds.has(team.id))),
    [manageableTeamIds, principalAdmin, teams]
  );

  const teamNameById = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team) => map.set(team.id, team.name));
    return map;
  }, [teams]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ApiProyecto | null>(null);

  function canManageProject(project: ApiProyecto): boolean {
    if (principalAdmin) return true;
    if (!project.equipo_id) return false;
    return manageableTeamIds.has(project.equipo_id);
  }

  function handleSave(input: ApiProyectoCreate | ApiProyectoUpdate) {
    if (editingProject) {
      if (!canManageProject(editingProject)) return;
      updateProject(editingProject.proyecto_id, input as ApiProyectoUpdate);
    } else if (canCreate) {
      createProject({
        ...(input as ApiProyectoCreate),
        owner_usuario_id: session?.user.id
      });
    }

    setModalOpen(false);
    setEditingProject(null);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-semibold text-text-primary">Proyectos</h1>
          <p className="text-base text-text-secondary">
            Proyectos en curso {principalAdmin ? "de toda la organizacion" : "de tus equipos"}.
          </p>
        </div>

        {canCreate ? (
          <Button
            type="button"
            className="w-auto px-5"
            onClick={() => {
              setEditingProject(null);
              setModalOpen(true);
            }}
          >
            + Crear proyecto
          </Button>
        ) : null}
      </header>

      {!canCreate ? (
        <div className="rounded-2xl border border-line bg-surface2 p-4 text-sm text-text-secondary">
          Tienes acceso de lectura. Solo jefes de equipo y administradores principales pueden crear o modificar proyectos.
        </div>
      ) : null}

      {visibleProjects.length === 0 ? (
        <p className="py-8 text-center text-text-secondary">No hay proyectos en curso para mostrar.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => {
            const canManage = canManageProject(project);

            return (
              <Card key={project.proyecto_id} className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{project.codigo}</p>
                    <h2 className="font-heading text-xl font-semibold text-text-primary">{project.nombre}</h2>
                  </div>

                  {canManage ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject(project);
                          setModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface2 hover:text-brand-primary"
                        aria-label="Editar proyecto"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProject(project.proyecto_id)}
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-red-50 hover:text-state-error"
                        aria-label="Eliminar proyecto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <p className="text-sm text-text-secondary">{project.descripcion || "Sin descripcion."}</p>

                <div className="space-y-1 text-sm text-text-secondary">
                  <p>Equipo: {project.equipo_id ? teamNameById.get(project.equipo_id) || "Equipo no disponible" : "Sin equipo"}</p>
                  <p>Inicio: {formatDate(project.fecha_inicio)}</p>
                  <p>Fin: {formatDate(project.fecha_fin)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSave}
        teams={creatableTeams}
        isPrincipal={principalAdmin}
        project={editingProject}
      />
    </section>
  );
}
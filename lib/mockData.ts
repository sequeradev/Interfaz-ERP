import type { Team } from "@/lib/types";

export const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Equipo de Producto",
    role: "admin",
    memberCount: 5,
    description: "Planificacion de hoja de ruta, refinamiento de backlog y coordinacion de lanzamientos."
  },
  {
    id: "team-2",
    name: "Equipo de Marketing",
    role: "member",
    memberCount: 5,
    description: "Planificacion de campanas, experimentos de crecimiento y analitica."
  },
  {
    id: "team-3",
    name: "Equipo de Diseno",
    role: "manager",
    memberCount: 5,
    description: "Investigacion UX, sistema de interfaz y QA de diseno."
  }
];

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  apiAddMiembro,
  apiCreateEquipo,
  apiDeleteEquipo,
  apiListEquipos,
  apiListMiembros,
  apiRemoveMiembro,
  apiUpdateEquipo
} from "@/lib/api/services";
import { getSession } from "@/lib/auth";
import { mockTeams } from "@/lib/mockData";
import type { Team } from "@/lib/types";

type CreateTeamInput = {
  name: string;
  description: string;
};

type TeamContextValue = {
  currentTeam: Team | null;
  setCurrentTeam: (team: Team) => void;
  teams: Team[];
  addTeam: (input: CreateTeamInput) => Team;
  updateTeam: (teamId: string, patch: { name?: string; description?: string }) => void;
  deleteTeam: (teamId: string) => void;
  addMember: (equipoId: string, usuarioId: string, rol?: string) => void;
  removeMember: (equipoId: string, usuarioId: string) => void;
};

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

function mapRoleFromApi(value?: string | null): Team["role"] {
  const normalized = (value || "").toLowerCase();
  if (normalized.includes("admin") || normalized.includes("owner")) return "admin";
  if (normalized.includes("manager") || normalized.includes("gestor")) return "manager";
  if (normalized.includes("viewer") || normalized.includes("lect")) return "viewer";
  return "member";
}

function buildTeamId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `team-${crypto.randomUUID()}`;
  }

  return `team-${Date.now()}`;
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowops_teams");
      if (stored) return JSON.parse(stored);
    }
    return mockTeams;
  });

  const [currentTeam, setCurrentTeam] = useState<Team | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowops_current_team");
      if (stored) return JSON.parse(stored);
    }
    return mockTeams[0] ?? null;
  });

  useEffect(() => {
    localStorage.setItem("flowops_teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    if (currentTeam) {
      localStorage.setItem("flowops_current_team", JSON.stringify(currentTeam));
    }
  }, [currentTeam]);

  useEffect(() => {
    let cancelled = false;

    async function syncTeamsFromApi() {
      const session = getSession();
      if (!session?.token || session.token === "mock") {
        return;
      }

      try {
        const apiTeams = await apiListEquipos(session.token);
        const meId = session.user.id;

        const teamsWithMembership = await Promise.all(
          apiTeams.map(async (apiTeam): Promise<Team> => {
            try {
              const members = await apiListMiembros(session.token, apiTeam.equipo_id);
              const myMember = members.find((member) => member.usuario_id === meId);
              return {
                id: apiTeam.equipo_id,
                name: apiTeam.nombre,
                description: apiTeam.descripcion?.trim() || "Sin descripcion por ahora.",
                memberCount: members.length,
                role: mapRoleFromApi(myMember?.rol_equipo)
              };
            } catch {
              return {
                id: apiTeam.equipo_id,
                name: apiTeam.nombre,
                description: apiTeam.descripcion?.trim() || "Sin descripcion por ahora.",
                memberCount: 0,
                role: "member"
              };
            }
          })
        );

        if (cancelled) return;
        setTeams(teamsWithMembership);
        setCurrentTeam((previous) => {
          if (!teamsWithMembership.length) {
            return previous;
          }
          if (!previous) {
            return teamsWithMembership[0];
          }
          return teamsWithMembership.find((team) => team.id === previous.id) ?? teamsWithMembership[0];
        });
      } catch {
        // Keep local teams as fallback.
      }
    }

    syncTeamsFromApi();
    return () => {
      cancelled = true;
    };
  }, []);

  const addTeam = useCallback((input: CreateTeamInput): Team => {
    const session = getSession();

    const localTeam: Team = {
      id: buildTeamId(),
      name: input.name.trim(),
      description: input.description.trim() || "Sin descripcion por ahora.",
      role: "admin",
      memberCount: 1
    };

    setTeams((prevTeams) => [...prevTeams, localTeam]);

    if (session?.token && session.token !== "mock") {
      void (async () => {
        try {
          const created = await apiCreateEquipo(session.token, {
            nombre: input.name.trim(),
            descripcion: input.description.trim()
          });

          setTeams((prevTeams) =>
            prevTeams.map((team) =>
              team.id === localTeam.id
                ? {
                    ...team,
                    id: created.equipo_id,
                    name: created.nombre,
                    description: created.descripcion?.trim() || team.description
                  }
                : team
            )
          );
        } catch {
          // Keep local team if API creation fails.
        }
      })();
    }

    return localTeam;
  }, []);

  const updateTeam = useCallback((teamId: string, patch: { name?: string; description?: string }) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? {
              ...team,
              name: patch.name?.trim() || team.name,
              description: patch.description?.trim() || team.description
            }
          : team
      )
    );

    const session = getSession();
    if (session?.token && session.token !== "mock") {
      void (async () => {
        try {
          await apiUpdateEquipo(session.token, teamId, {
            nombre: patch.name?.trim(),
            descripcion: patch.description?.trim()
          });
        } catch {
          // Keep local update if API fails.
        }
      })();
    }
  }, []);

  const deleteTeam = useCallback((teamId: string) => {
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
    setCurrentTeam((prev) => (prev?.id === teamId ? null : prev));

    const session = getSession();
    if (session?.token && session.token !== "mock") {
      void (async () => {
        try {
          await apiDeleteEquipo(session.token, teamId);
        } catch {
          // Keep local delete if API fails.
        }
      })();
    }
  }, []);

  const addMember = useCallback((equipoId: string, usuarioId: string, rol = "member") => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === equipoId ? { ...team, memberCount: team.memberCount + 1 } : team
      )
    );

    const session = getSession();
    if (session?.token && session.token !== "mock") {
      void (async () => {
        try {
          await apiAddMiembro(session.token, equipoId, { usuario_id: usuarioId, rol_equipo: rol });
        } catch {
          // Revert optimistic update
          setTeams((prev) =>
            prev.map((team) =>
              team.id === equipoId ? { ...team, memberCount: Math.max(0, team.memberCount - 1) } : team
            )
          );
        }
      })();
    }
  }, []);

  const removeMember = useCallback((equipoId: string, usuarioId: string) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === equipoId ? { ...team, memberCount: Math.max(0, team.memberCount - 1) } : team
      )
    );

    const session = getSession();
    if (session?.token && session.token !== "mock") {
      void (async () => {
        try {
          await apiRemoveMiembro(session.token, equipoId, usuarioId);
        } catch {
          // Revert optimistic update
          setTeams((prev) =>
            prev.map((team) =>
              team.id === equipoId ? { ...team, memberCount: team.memberCount + 1 } : team
            )
          );
        }
      })();
    }
  }, []);

  const value = useMemo<TeamContextValue>(
    () => ({
      currentTeam,
      setCurrentTeam,
      teams,
      addTeam,
      updateTeam,
      deleteTeam,
      addMember,
      removeMember
    }),
    [currentTeam, teams, addTeam, updateTeam, deleteTeam, addMember, removeMember]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeamContext(): TeamContextValue {
  const context = useContext(TeamContext);

  if (!context) {
    throw new Error("useTeamContext debe usarse dentro de TeamProvider.");
  }

  return context;
}

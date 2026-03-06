"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
};

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

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

  const addTeam = useCallback((input: CreateTeamInput): Team => {
    const newTeam: Team = {
      id: buildTeamId(),
      name: input.name.trim(),
      description: input.description.trim() || "Sin descripcion por ahora.",
      role: "admin",
      memberCount: 1
    };

    setTeams((prevTeams) => [...prevTeams, newTeam]);
    return newTeam;
  }, []);

  const value = useMemo<TeamContextValue>(
    () => ({
      currentTeam,
      setCurrentTeam,
      teams,
      addTeam
    }),
    [currentTeam, teams, addTeam]
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

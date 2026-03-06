import type { User } from "@/lib/types";

export const mockUsersByTeam: Record<string, User[]> = {
  "team-1": [
    { id: "user-1", teamId: "team-1", name: "NICO", initials: "NI", email: "nico@flowops.com", role: "Gerente" },
    { id: "user-2", teamId: "team-1", name: "DAVID", initials: "DA", email: "david@flowops.com", role: "Responsable de producto" },
    { id: "user-3", teamId: "team-1", name: "DANI", initials: "DA", email: "dani@flowops.com", role: "Ingeniero Universitario" },
    { id: "user-4", teamId: "team-1", name: "GERMAN", initials: "GE", email: "german@flowops.com", role: "QA" },
    { id: "user-5", teamId: "team-1", name: "JAVIER", initials: "JA", email: "javier@flowops.com", role: "Analista" }
  ],
  "team-2": [
    { id: "user-6", teamId: "team-2", name: "JIMENA", initials: "JI", email: "jimena@flowops.com", role: "Coordinadora" },
    { id: "user-7", teamId: "team-2", name: "JOSE", initials: "JO", email: "jose@flowops.com", role: "Especialista SEO" },
    { id: "user-8", teamId: "team-2", name: "JUANLU", initials: "JU", email: "juanlu@flowops.com", role: "Analista de Marketing" },
    { id: "user-9", teamId: "team-2", name: "MANU SEQUERA", initials: "MS", email: "manus@flowops.com", role: "Creador de Contenido" },
    { id: "user-10", teamId: "team-2", name: "MANU JIMENEZ", initials: "MJ", email: "manuj@flowops.com", role: "Media Buyer" }
  ],
  "team-3": [
    { id: "user-11", teamId: "team-3", name: "MANU AGUILAR", initials: "MA", email: "manua@flowops.com", role: "Disenador" },
    { id: "user-12", teamId: "team-3", name: "MASSIMO", initials: "MA", email: "massimo@flowops.com", role: "Investigador UX" },
    { id: "user-13", teamId: "team-3", name: "NACHO", initials: "NA", email: "nacho@flowops.com", role: "Operaciones de diseno" },
    { id: "user-14", teamId: "team-3", name: "PABLO", initials: "PA", email: "pablo@flowops.com", role: "Ilustrador" },
    { id: "user-15", teamId: "team-3", name: "TONI", initials: "TO", email: "toni@flowops.com", role: "Director de Arte" }
  ]
};

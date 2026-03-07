import { create } from "zustand";
import {
  apiCreateUsuario,
  apiDeleteUsuario,
  apiListUsuarios,
  apiUpdateUsuario
} from "@/lib/api/services";
import type { ApiUsuario, ApiUsuarioCreate, ApiUsuarioUpdate } from "@/lib/api/types";
import { getSession } from "@/lib/auth";

const LS_KEY = "flowops-usuarios-v1";

function loadFromStorage(): ApiUsuario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ApiUsuario[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(usuarios: ApiUsuario[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(usuarios));
  } catch {
    // ignore
  }
}

type UsuariosStore = {
  usuarios: ApiUsuario[];
  loading: boolean;
  _hydrated: boolean;
  hydrate: () => void;
  createUsuario: (input: ApiUsuarioCreate) => void;
  updateUsuario: (usuarioId: string, patch: ApiUsuarioUpdate) => void;
  deleteUsuario: (usuarioId: string) => void;
};

export const useUsuariosStore = create<UsuariosStore>((set, get) => ({
  usuarios: [],
  loading: false,
  _hydrated: false,

  hydrate() {
    if (get()._hydrated) return;
    const saved = loadFromStorage();
    set({ usuarios: saved, _hydrated: true });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    set({ loading: true });
    void (async () => {
      try {
        const data = await apiListUsuarios(session.token);
        set({ usuarios: data, loading: false });
        saveToStorage(data);
      } catch {
        set({ loading: false });
      }
    })();
  },

  createUsuario(input) {
    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        const created = await apiCreateUsuario(session.token, input);
        set((s) => {
          const next = [...s.usuarios, created];
          saveToStorage(next);
          return { usuarios: next };
        });
      } catch {
        // Silent fail
      }
    })();
  },

  updateUsuario(usuarioId, patch) {
    set((s) => {
      const next = s.usuarios.map((u) =>
        u.usuario_id === usuarioId ? { ...u, ...patch } : u
      );
      saveToStorage(next);
      return { usuarios: next };
    });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        await apiUpdateUsuario(session.token, usuarioId, patch);
      } catch {
        // Keep local update
      }
    })();
  },

  deleteUsuario(usuarioId) {
    set((s) => {
      const next = s.usuarios.filter((u) => u.usuario_id !== usuarioId);
      saveToStorage(next);
      return { usuarios: next };
    });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        await apiDeleteUsuario(session.token, usuarioId);
      } catch {
        // Keep local delete
      }
    })();
  }
}));

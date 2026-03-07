import { create } from "zustand";
import {
  apiCreateMercado,
  apiDeleteMercado,
  apiListMercados,
  apiUpdateMercado
} from "@/lib/api/services";
import type { ApiMercado, ApiMercadoCreate, ApiMercadoUpdate } from "@/lib/api/types";
import { getSession } from "@/lib/auth";

const LS_KEY = "flowops-mercados-v1";

function loadFromStorage(): ApiMercado[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ApiMercado[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(mercados: ApiMercado[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(mercados));
  } catch {
    // ignore
  }
}

type MercadosStore = {
  mercados: ApiMercado[];
  loading: boolean;
  _hydrated: boolean;
  hydrate: () => void;
  createMercado: (input: ApiMercadoCreate) => void;
  updateMercado: (mercadoId: string, patch: ApiMercadoUpdate) => void;
  deleteMercado: (mercadoId: string) => void;
};

export const useMercadosStore = create<MercadosStore>((set, get) => ({
  mercados: [],
  loading: false,
  _hydrated: false,

  hydrate() {
    if (get()._hydrated) return;
    const saved = loadFromStorage();
    set({ mercados: saved, _hydrated: true });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    set({ loading: true });
    void (async () => {
      try {
        const data = await apiListMercados(session.token);
        set({ mercados: data, loading: false });
        saveToStorage(data);
      } catch {
        set({ loading: false });
      }
    })();
  },

  createMercado(input) {
    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        const created = await apiCreateMercado(session.token, input);
        set((s) => {
          const next = [...s.mercados, created];
          saveToStorage(next);
          return { mercados: next };
        });
      } catch {
        // Silent fail
      }
    })();
  },

  updateMercado(mercadoId, patch) {
    set((s) => {
      const next = s.mercados.map((m) =>
        m.mercado_id === mercadoId ? { ...m, ...patch } : m
      );
      saveToStorage(next);
      return { mercados: next };
    });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        await apiUpdateMercado(session.token, mercadoId, patch);
      } catch {
        // Keep local update
      }
    })();
  },

  deleteMercado(mercadoId) {
    set((s) => {
      const next = s.mercados.filter((m) => m.mercado_id !== mercadoId);
      saveToStorage(next);
      return { mercados: next };
    });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        await apiDeleteMercado(session.token, mercadoId);
      } catch {
        // Keep local delete
      }
    })();
  }
}));

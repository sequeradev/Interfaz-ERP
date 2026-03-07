import { create } from "zustand";
import {
  apiCreateCliente,
  apiDeleteCliente,
  apiListClientes,
  apiUpdateCliente
} from "@/lib/api/services";
import type { ApiCliente, ApiClienteCreate, ApiClienteUpdate } from "@/lib/api/types";
import { getSession } from "@/lib/auth";

const LS_KEY = "flowops-clientes-v1";

function loadFromStorage(): ApiCliente[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ApiCliente[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(clientes: ApiCliente[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(clientes));
  } catch {
    // ignore
  }
}

type ClientesStore = {
  clientes: ApiCliente[];
  loading: boolean;
  _hydrated: boolean;
  hydrate: () => void;
  createCliente: (input: ApiClienteCreate) => void;
  updateCliente: (clienteId: string, patch: ApiClienteUpdate) => void;
  deleteCliente: (clienteId: string) => void;
};

export const useClientesStore = create<ClientesStore>((set, get) => ({
  clientes: [],
  loading: false,
  _hydrated: false,

  hydrate() {
    if (get()._hydrated) return;
    const saved = loadFromStorage();
    set({ clientes: saved, _hydrated: true });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    set({ loading: true });
    void (async () => {
      try {
        const data = await apiListClientes(session.token);
        set({ clientes: data, loading: false });
        saveToStorage(data);
      } catch {
        set({ loading: false });
      }
    })();
  },

  createCliente(input) {
    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        const created = await apiCreateCliente(session.token, input);
        set((s) => {
          const next = [...s.clientes, created];
          saveToStorage(next);
          return { clientes: next };
        });
      } catch {
        // Silent fail
      }
    })();
  },

  updateCliente(clienteId, patch) {
    set((s) => {
      const next = s.clientes.map((c) =>
        c.cliente_id === clienteId ? { ...c, ...patch } : c
      );
      saveToStorage(next);
      return { clientes: next };
    });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        await apiUpdateCliente(session.token, clienteId, patch);
      } catch {
        // Keep local update
      }
    })();
  },

  deleteCliente(clienteId) {
    set((s) => {
      const next = s.clientes.filter((c) => c.cliente_id !== clienteId);
      saveToStorage(next);
      return { clientes: next };
    });

    const session = getSession();
    if (!session?.token || session.token === "mock") return;

    void (async () => {
      try {
        await apiDeleteCliente(session.token, clienteId);
      } catch {
        // Keep local delete
      }
    })();
  }
}));

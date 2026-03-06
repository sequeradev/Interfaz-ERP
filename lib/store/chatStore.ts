import { create } from "zustand";

export type ChatMessage = {
    id: string;
    senderName: string;
    senderId: string;
    content: string;
    timestamp: string;
};

type ChatState = {
    isOpen: boolean;
    messages: ChatMessage[];
    unread: number;
};

type ChatActions = {
    toggle: () => void;
    open: () => void;
    close: () => void;
    send: (content: string) => void;
    clearUnread: () => void;
    hydrate: () => void;
};

type ChatStore = ChatState & ChatActions & { _hydrated: boolean };

const TEAM_MEMBERS = [
    { id: "ana", name: "Ana G." },
    { id: "carlos", name: "Carlos M." },
    { id: "laura", name: "Laura P." },
    { id: "ruben", name: "Rubén T." },
];

const TEAM_RESPONSES = [
    "¡Claro, me parece bien!",
    "Yo me encargo de revisar eso luego.",
    "¿Alguien ha visto la última actualización del proyecto?",
    "Perfecto, gracias.",
    "Acabo de terminar mi parte.",
    "Estoy en una reunión, luego respondo bien.",
    "¿Cómo vamos con los tiempos de entrega?",
    "¡Buen trabajo equipo!",
];

function getRandomTeamResponse() {
    const member = TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)];
    const response = TEAM_RESPONSES[Math.floor(Math.random() * TEAM_RESPONSES.length)];
    return { member, response };
}

const INIT_MESSAGE: ChatMessage = {
    id: "init-1",
    senderName: "Carlos M.",
    senderId: "carlos",
    content: "¡Hola equipo! ¿Todos listos para arrancar con las tareas de hoy?",
    timestamp: new Date().toISOString(),
};

const LS_KEY = "flowops-teamchat-v1";

function loadFromStorage(): ChatState | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ChatState;
    } catch {
        return null;
    }
}

function saveToStorage(state: ChatState) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
}

export const useChatStore = create<ChatStore>((set, get) => ({
    isOpen: false,
    messages: [INIT_MESSAGE],
    unread: 0,
    _hydrated: false,

    hydrate() {
        if (get()._hydrated) return;
        const saved = loadFromStorage();
        if (saved) {
            set({ isOpen: saved.isOpen, messages: saved.messages, unread: saved.unread, _hydrated: true });
        } else {
            set({ _hydrated: true });
        }
    },

    toggle() {
        const wasOpen = get().isOpen;
        set((s) => {
            const next: ChatState = { isOpen: !s.isOpen, unread: wasOpen ? s.unread : 0, messages: s.messages };
            saveToStorage(next);
            return next;
        });
    },

    open() {
        set((s) => {
            const next: ChatState = { isOpen: true, unread: 0, messages: s.messages };
            saveToStorage(next);
            return next;
        });
    },

    close() {
        set((s) => {
            const next: ChatState = { isOpen: false, unread: s.unread, messages: s.messages };
            saveToStorage(next);
            return next;
        });
    },

    clearUnread() {
        set((s) => {
            const next: ChatState = { isOpen: s.isOpen, unread: 0, messages: s.messages };
            saveToStorage(next);
            return next;
        });
    },

    send(content: string) {
        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderName: "Tú",
            senderId: "me",
            content,
            timestamp: new Date().toISOString(),
        };

        set((s) => {
            const next: ChatState = { isOpen: s.isOpen, unread: s.unread, messages: [...s.messages, userMsg] };
            saveToStorage(next);
            return next;
        });

        // Simulate teammates typing back
        setTimeout(() => {
            const { member, response } = getRandomTeamResponse();
            const teamMsg: ChatMessage = {
                id: `msg-${Date.now()}`,
                senderName: member.name,
                senderId: member.id,
                content: response,
                timestamp: new Date().toISOString(),
            };
            set((s) => {
                const isOpen = s.isOpen;
                const next: ChatState = {
                    isOpen,
                    messages: [...s.messages, teamMsg],
                    unread: isOpen ? 0 : s.unread + 1,
                };
                saveToStorage(next);
                return next;
            });
        }, 1500 + Math.random() * 2000);
    },
}));

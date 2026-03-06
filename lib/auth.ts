import { clearStoredSession, getStoredSession, saveStoredSession } from "@/lib/storage";
import { apiLogin, apiReadMe } from "@/lib/api/services";

export type MockSession = {
  user: {
    id?: string;
    email: string;
    name: string;
    role?: string;
  };
  token: string;
};

type SignInResult =
  | {
      success: true;
      session: MockSession;
    }
  | {
      success: false;
      error: string;
    };

const DEMO_EMAIL = "demo@flowops.com";
const DEMO_PASSWORD = "demo1234";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  await wait(250);

  try {
    const token = await apiLogin(email, password);
    const me = await apiReadMe(token.access_token);

    return {
      success: true,
      session: {
        user: {
          id: me.usuario_id,
          email: me.email,
          name: `${me.nombre} ${me.apellidos}`.trim(),
          role: me.rol
        },
        token: token.access_token
      }
    };
  } catch {
    // Keep demo fallback for local/offline mode.
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      return {
        success: true,
        session: {
          user: {
            email,
            name: "Usuario Demo",
            role: "admin"
          },
          token: "mock"
        }
      };
    }
  }

  return {
    success: false,
    error: "Correo o contrasena invalidos."
  };
}

export function saveSession(session: MockSession): void {
  saveStoredSession<MockSession>(session);
}

export function getSession(): MockSession | null {
  return getStoredSession<MockSession>();
}

export function clearSession(): void {
  clearStoredSession();
}

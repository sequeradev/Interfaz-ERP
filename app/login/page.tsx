"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Mail, Lock, Zap, Chrome, ArrowRight, Sparkles } from "lucide-react";
import { getSession, saveSession, signIn } from "@/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = "magic" | "password";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace("/app");
      return;
    }
    setCheckingSession(false);
  }, [router]);

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Introduce tu correo electrónico.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Correo no válido.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setMagicSent(true);
  }

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setEmailError("");
    setGeneralError("");
    if (!email.trim() || !password) {
      setGeneralError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.success) {
      saveSession(result.session);
      router.replace("/app");
    } else {
      setGeneralError("Credenciales incorrectas. Usa demo@flowops.com / demo1234");
    }
  }

  function handleDemoLogin() {
    setEmail("demo@flowops.com");
    setPassword("demo1234");
    setMode("password");
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-appbg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-appbg">
      {/* Gradient background orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-secondary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up px-4 py-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary shadow-lift">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            FlowOps
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Tu espacio de trabajo inteligente
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
          {/* Mode tabs */}
          <div className="mb-6 flex rounded-xl border border-line bg-surface2 p-1">
            <button
              type="button"
              onClick={() => { setMode("magic"); setGeneralError(""); }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${mode === "magic"
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
                }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Zap size={13} />
                Magic Link
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("password"); setMagicSent(false); setGeneralError(""); }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${mode === "password"
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
                }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Lock size={13} />
                Contraseña
              </span>
            </button>
          </div>

          {/* Magic link mode */}
          {mode === "magic" && !magicSent && (
            <form onSubmit={handleMagicLink} noValidate className="space-y-4">
              <div>
                <label htmlFor="magic-email" className="mb-1.5 block text-sm font-medium text-text-primary">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="magic-email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    className="w-full rounded-xl border border-line bg-surface2 py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-state-error">{emailError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Enviar magic link <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Magic link sent */}
          {mode === "magic" && magicSent && (
            <div className="py-4 text-center animate-fade-in">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-state-success/10 text-state-success">
                <Mail size={22} />
              </div>
              <p className="font-medium text-text-primary">¡Revisa tu bandeja de entrada!</p>
              <p className="mt-1 text-sm text-text-secondary">
                Enviamos un enlace mágico a <strong>{email}</strong>
              </p>
              <button
                type="button"
                onClick={() => setMagicSent(false)}
                className="mt-4 text-sm text-brand-primary hover:underline"
              >
                Cambiar correo
              </button>
            </div>
          )}

          {/* Password mode */}
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
              {generalError && (
                <div className="rounded-xl border border-state-error/30 bg-state-error/5 px-3 py-2.5 text-xs text-state-error">
                  {generalError}
                </div>
              )}
              <div>
                <label htmlFor="pw-email" className="mb-1.5 block text-sm font-medium text-text-primary">
                  Correo
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="pw-email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface2 py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pw-password" className="mb-1.5 block text-sm font-medium text-text-primary">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="pw-password"
                    type="password"
                    value={password}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface2 py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>Entrar <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-text-muted">o continúa con</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          {/* OAuth buttons */}
          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-surface2 active:scale-[0.98]"
            >
              <Chrome size={16} />
              Google
            </button>
          </div>
        </div>

        {/* Demo access */}
        <div className="mt-4 rounded-xl border border-brand-accent/30 bg-brand-accent/5 p-3.5">
          <p className="text-center text-xs font-medium text-brand-accent">
            🚀 Acceso demo
          </p>
          <p className="mt-1 text-center text-xs text-text-secondary">
            demo@flowops.com · demo1234
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-accent/15 py-2 text-xs font-semibold text-brand-accent transition-colors hover:bg-brand-accent/25"
          >
            Entrar como demo <ArrowRight size={12} />
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Al continuar aceptas los{" "}
          <Link href="#" className="underline hover:text-text-secondary">
            Términos de uso
          </Link>{" "}
          y la{" "}
          <Link href="#" className="underline hover:text-text-secondary">
            Política de privacidad
          </Link>
        </p>
      </div>
    </main>
  );
}

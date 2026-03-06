"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { TeamProvider } from "@/context/TeamContext";
import { WorkProvider } from "@/context/WorkContext";
import { clearSession, getSession, type MockSession } from "@/lib/auth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small timeout to ensure hydration finishes before strictly redirecting
    const timer = setTimeout(() => {
      const currentSession = getSession();
      if (!currentSession) {
        router.replace("/login");
      } else {
        setSession(currentSession);
      }
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  function handleSignOut() {
    clearSession();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-appbg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Preparando espacio de trabajo...</p>
        </div>
      </main>
    );
  }

  // If we finished loading but have no session, we render nothing while the router redirects
  if (!session) return null;

  return (
    <TeamProvider>
      <WorkProvider>
        <AppShell session={session} onSignOut={handleSignOut}>
          {children}
        </AppShell>
        <FloatingChat />
      </WorkProvider>
    </TeamProvider>
  );
}

function AppShell({
  children,
  session,
  onSignOut
}: {
  children: ReactNode;
  session: MockSession;
  onSignOut: () => void;
}) {
  return (
    <div className="min-h-screen bg-appbg">
      <LeftSidebar session={session} onSignOut={onSignOut} />

      <main className="pb-8 md:pl-[260px]">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}

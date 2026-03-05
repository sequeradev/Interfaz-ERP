"use client";

import { useMemo, useState } from "react";
import { PostCard } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { TaskModal, type TaskFormValues } from "@/components/tasks/TaskModal";
import { useTeamContext } from "@/context/TeamContext";
import { useWorkContext } from "@/context/WorkContext";
import { cn } from "@/lib/cn";
import { mockUsersByTeam } from "@/lib/mockUsers";
import type { FeedPost, FeedScope } from "@/lib/types";

type FeedTab = FeedScope;

const FEED_TABS: FeedTab[] = ["general", "teams"];

function formatTab(tab: FeedTab): string {
  return tab === "general" ? "General" : "Equipos";
}

export default function ChatPage() {
  const { currentTeam } = useTeamContext();
  const { feedPosts, feedEvents, addFeedPost, addFeedEvent, createTask } = useWorkContext();
  const [activeTab, setActiveTab] = useState<FeedTab>("general");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskPrefill, setTaskPrefill] = useState<Partial<TaskFormValues>>({});

  const teamUsers = currentTeam ? mockUsersByTeam[currentTeam.id] ?? [] : [];

  function handleSubmitPost(content: string) {
    if (!currentTeam) {
      return;
    }

    addFeedPost({
      teamId: currentTeam.id,
      author: "Usuario Demo",
      role: "Administrador",
      content,
      scope: activeTab
    });
  }

  function handleMarkAsTask(post: FeedPost) {
    const title = post.content.length > 60 ? `${post.content.slice(0, 60).trim()}...` : post.content;
    setTaskPrefill({
      title,
      description: post.content,
      status: "todo",
      priority: "medium"
    });
    setTaskModalOpen(true);
  }

  const visibleFeedItems = useMemo(() => {
    if (!currentTeam) {
      return [];
    }

    const teamPosts = feedPosts.filter(
      (post) => post.teamId === currentTeam.id && post.scope === activeTab
    );
    const teamEvents = feedEvents.filter(
      (event) => event.teamId === currentTeam.id || event.teamId == null
    );

    return [...teamPosts, ...teamEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [feedPosts, feedEvents, currentTeam, activeTab]);

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-4 space-y-1">
          <h1 className="font-heading text-4xl font-semibold text-text-primary">Chat</h1>
          <p className="text-base text-text-secondary">Conversacion y actividad del equipo.</p>
        </div>

        <div className="flex items-center gap-1" role="tablist" aria-label="Secciones del feed">
          {FEED_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-xl px-4 py-2 text-base font-medium transition-colors",
                activeTab === tab
                  ? "bg-[#e9f0f7] text-brand-primary"
                  : "text-text-secondary hover:bg-[#f3f7fa] hover:text-text-primary"
              )}
            >
              {formatTab(tab)}
            </button>
          ))}
        </div>
      </header>

      <PostComposer authorName="Usuario Demo" onSubmitPost={handleSubmitPost} />

      <div className="space-y-4">
        {visibleFeedItems.length > 0 ? (
          visibleFeedItems.map((post) => (
            <PostCard key={post.id} post={post} onMarkAsTask={handleMarkAsTask} />
          ))
        ) : (
          <div className="rounded-xl border border-line bg-surface p-8 text-center text-base text-text-secondary shadow-sm">
            Aun no hay actividad en esta pestana para {currentTeam?.name ?? "tu equipo"}.
          </div>
        )}
      </div>

      <TaskModal
        open={taskModalOpen}
        users={teamUsers}
        title="Crear tarea desde actualizacion"
        submitLabel="Crear tarea"
        initialValues={taskPrefill}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={(values) => {
          if (!currentTeam) {
            return;
          }

          const task = createTask({
            teamId: currentTeam.id,
            title: values.title,
            description: values.description,
            assigneeId: values.assigneeId,
            dueDate: values.dueDate,
            priority: values.priority,
            status: values.status
          });

          addFeedEvent({
            teamId: currentTeam.id,
            content: `Tarea creada a partir de una actualizacion: ${task.title}`,
            author: "Sistema",
            eventType: "task_created"
          });

          setTaskModalOpen(false);
          setTaskPrefill({});
        }}
      />
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { PostCard } from "@/components/feed/PostCard";
import { PostComposer } from "@/components/feed/PostComposer";
import { Card } from "@/components/ui/card";
import { TaskModal, type TaskFormValues } from "@/components/tasks/TaskModal";
import { useTeamContext } from "@/context/TeamContext";
import { useWorkContext } from "@/context/WorkContext";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { mockUsersByTeam } from "@/lib/mockUsers";
import type { FeedPost } from "@/lib/types";

type ChatMode = "general" | "team" | "direct";

type ChatSelection = {
  id: string;
  mode: ChatMode;
  label: string;
  userId?: string;
};

export default function ChatPage() {
  const { currentTeam } = useTeamContext();
  const { feedPosts, feedEvents, addFeedPost, addFeedEvent, createTask } = useWorkContext();
  const session = getSession();
  const [activeChatId, setActiveChatId] = useState("general");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskPrefill, setTaskPrefill] = useState<Partial<TaskFormValues>>({});

  const teamUsers = currentTeam ? mockUsersByTeam[currentTeam.id] ?? [] : [];
  const currentUser =
    teamUsers.find((user) => user.email === session?.user.email || user.name === session?.user.name) ??
    teamUsers[0] ??
    null;
  const directUsers = currentUser ? teamUsers.filter((user) => user.id !== currentUser.id) : teamUsers;

  const chatSelections = useMemo<ChatSelection[]>(() => {
    const baseSelections: ChatSelection[] = [
      { id: "general", mode: "general", label: "Chat general" },
      { id: "team", mode: "team", label: `Chat de ${currentTeam?.name ?? "equipo"}` }
    ];

    const directSelections = directUsers.map((user) => ({
      id: `direct:${user.id}`,
      mode: "direct" as const,
      label: user.name,
      userId: user.id
    }));

    return [...baseSelections, ...directSelections];
  }, [currentTeam?.name, directUsers]);

  const activeChat = chatSelections.find((chat) => chat.id === activeChatId) ?? chatSelections[0] ?? null;
  const activeDirectUser =
    activeChat?.mode === "direct" ? directUsers.find((user) => user.id === activeChat.userId) ?? null : null;

  function handleSubmitPost(content: string) {
    if (!currentTeam || !activeChat) {
      return;
    }

    const scope = activeChat.mode === "general" ? "general" : "teams";
    const normalizedContent =
      activeChat.mode === "direct" && activeDirectUser
        ? `[Directo a ${activeDirectUser.name}] ${content}`
        : content;

    addFeedPost({
      teamId: currentTeam.id,
      author: session?.user.name ?? "Usuario Demo",
      role: currentUser?.role ?? "Miembro",
      content: normalizedContent,
      scope
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
    if (!currentTeam || !activeChat) {
      return [];
    }

    if (activeChat.mode === "general") {
      const generalPosts = feedPosts.filter((post) => post.teamId === currentTeam.id && post.scope === "general");
      const generalEvents = feedEvents.filter((event) => event.teamId === currentTeam.id || event.teamId == null);
      return [...generalPosts, ...generalEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (activeChat.mode === "team") {
      const teamPosts = feedPosts.filter((post) => post.teamId === currentTeam.id && post.scope === "teams");
      const teamEvents = feedEvents.filter((event) => event.teamId === currentTeam.id);
      return [...teamPosts, ...teamEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (!activeDirectUser) {
      return [];
    }

    return feedPosts
      .filter((post) => {
        if (post.teamId !== currentTeam.id) {
          return false;
        }

        const authoredByParticipants =
          post.author === (session?.user.name ?? "") || post.author === activeDirectUser.name;
        const taggedAsDirect = post.content.startsWith(`[Directo a ${activeDirectUser.name}]`);

        return authoredByParticipants && (taggedAsDirect || post.author === activeDirectUser.name);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [feedPosts, feedEvents, currentTeam, activeChat, activeDirectUser, session?.user.name]);

  return (
    <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <Card className="p-4">
          <h2 className="font-heading text-xl font-semibold text-text-primary">Chats</h2>
          <p className="mt-1 text-sm text-text-secondary">Selecciona una conversacion.</p>
        </Card>

        <Card className="p-3">
          <ul className="space-y-1">
            {chatSelections.slice(0, 2).map((chat) => (
              <li key={chat.id}>
                <button
                  type="button"
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    activeChatId === chat.id
                      ? "bg-[#e9f0f7] text-brand-primary"
                      : "text-text-secondary hover:bg-[#f3f7fa] hover:text-text-primary"
                  )}
                >
                  {chat.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-line pt-3">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Chats directos
            </p>
            <ul className="space-y-1">
              {chatSelections.slice(2).length > 0 ? (
                chatSelections.slice(2).map((chat) => (
                  <li key={chat.id}>
                    <button
                      type="button"
                      onClick={() => setActiveChatId(chat.id)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                        activeChatId === chat.id
                          ? "bg-[#e9f0f7] text-brand-primary"
                          : "text-text-secondary hover:bg-[#f3f7fa] hover:text-text-primary"
                      )}
                    >
                      {chat.label}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-text-secondary">No hay otros trabajadores en este equipo.</li>
              )}
            </ul>
          </div>
        </Card>
      </aside>

      <div className="w-full space-y-6">
        <header className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <h1 className="font-heading text-4xl font-semibold text-text-primary">{activeChat?.label ?? "Chat"}</h1>
          <p className="mt-2 text-base text-text-secondary">
            {activeChat?.mode === "direct"
              ? "Conversacion directa entre trabajadores del mismo equipo."
              : "Conversacion y actividad del equipo."}
          </p>
        </header>

        <PostComposer authorName={session?.user.name ?? "Usuario Demo"} onSubmitPost={handleSubmitPost} />

        <div className="space-y-4">
          {visibleFeedItems.length > 0 ? (
            visibleFeedItems.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onMarkAsTask={post.kind === "post" ? handleMarkAsTask : undefined}
              />
            ))
          ) : (
            <div className="rounded-xl border border-line bg-surface p-8 text-center text-base text-text-secondary shadow-sm">
              No hay mensajes para esta conversacion.
            </div>
          )}
        </div>
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

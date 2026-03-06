"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { mockFeedPosts } from "@/lib/mockFeed";
import { mockMeetingsByTeam } from "@/lib/mockMeetings";
import type { FeedEvent, FeedPost, FeedScope, Meeting, Task, TaskPriority, TaskStatus } from "@/lib/types";

type CreateTaskInput = {
  teamId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
};

type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "assigneeId" | "dueDate" | "priority" | "status">
>;

type CreateMeetingInput = Omit<Meeting, "id" | "createdAt"> & {
  authorName?: string;
};

type UpdateMeetingInput = Partial<
  Pick<Meeting, "title" | "description" | "start" | "end" | "location" | "scope" | "teamId">
> & {
  authorName?: string;
};

type AddFeedEventInput = {
  teamId?: string | null;
  content: string;
  author: string;
  eventType: FeedEvent["eventType"];
};

type AddFeedPostInput = {
  teamId: string;
  author: string;
  role: string;
  content: string;
  scope: FeedScope;
};

type WorkContextValue = {
  tasksByTeam: Record<string, Task[]>;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (taskId: string, updates: UpdateTaskInput) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newIndex: number) => void;
  deleteTask: (taskId: string) => void;
  feedPosts: FeedPost[];
  feedEvents: FeedEvent[];
  meetingsByTeam: Record<string, Meeting[]>;
  addFeedPost: (input: AddFeedPostInput) => void;
  addFeedEvent: (input: AddFeedEventInput) => void;
  createMeeting: (input: CreateMeetingInput) => Meeting;
  updateMeeting: (meetingId: string, patch: UpdateMeetingInput) => void;
  deleteMeeting: (meetingId: string, authorName?: string) => void;
  getMeetingsForTeam: (teamId: string) => Meeting[];
};

const initialTasksByTeam: Record<string, Task[]> = {
  "team-1": [
    {
      id: "task-1",
      teamId: "team-1",
      title: "Finalizar hoja de ruta de producto",
      description: "Alinear la hoja de ruta con objetivos de Q2 e hitos de lanzamiento.",
      status: "todo",
      priority: "high",
      assigneeId: "user-1",
      dueDate: "2026-03-08",
      createdAt: "2026-03-04T08:20:00.000Z"
    },
    {
      id: "task-2",
      teamId: "team-1",
      title: "Preparar notas para revision de API",
      description: "Resumir decisiones pendientes de endpoints para revision de arquitectura.",
      status: "in_progress",
      priority: "medium",
      assigneeId: "user-2",
      dueDate: "2026-03-06",
      createdAt: "2026-03-04T07:40:00.000Z"
    },
    {
      id: "task-3",
      teamId: "team-1",
      title: "Cerrar acciones de retrospectiva de sprint",
      status: "done",
      priority: "low",
      assigneeId: "user-3",
      dueDate: "2026-03-04",
      createdAt: "2026-03-03T14:00:00.000Z"
    }
  ],
  "team-2": [
    {
      id: "task-4",
      teamId: "team-2",
      title: "Publicar borrador de campana de lanzamiento",
      description: "Preparar copys de redes y matriz de campanas pagadas.",
      status: "todo",
      priority: "high",
      assigneeId: "user-5",
      dueDate: "2026-03-09",
      createdAt: "2026-03-04T08:35:00.000Z"
    },
    {
      id: "task-5",
      teamId: "team-2",
      title: "Revisar panel de conversion",
      status: "in_progress",
      priority: "medium",
      assigneeId: "user-7",
      dueDate: "2026-03-07",
      createdAt: "2026-03-04T08:10:00.000Z"
    }
  ],
  "team-3": [
    {
      id: "task-6",
      teamId: "team-3",
      title: "Validar tokens de diseno para onboarding",
      status: "todo",
      priority: "medium",
      assigneeId: "user-8",
      dueDate: "2026-03-11",
      createdAt: "2026-03-04T08:00:00.000Z"
    },
    {
      id: "task-7",
      teamId: "team-3",
      title: "Revisar especificaciones de interaccion con producto",
      status: "done",
      priority: "low",
      assigneeId: "user-9",
      dueDate: "2026-03-04",
      createdAt: "2026-03-03T16:20:00.000Z"
    }
  ]
};

const initialFeedEvents: FeedEvent[] = [
  {
    id: "event-1",
    kind: "event",
    teamId: "team-1",
    content: "Resumen de retrospectiva del sprint publicado.",
    author: "Sistema",
    timestamp: "hace 2 h",
    createdAt: "2026-03-04T08:30:00.000Z",
    eventType: "system"
  }
];

const WorkContext = createContext<WorkContextValue | undefined>(undefined);

function toRelativeTime(dateIso: string): string {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    return "ahora";
  }
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} d`;
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

function formatMeetingMoment(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function getMeetingScopeLabel(scope: Meeting["scope"]): string {
  return scope === "general" ? "General" : "Equipo";
}

function getMeetingBucketKey(meeting: Pick<Meeting, "scope" | "teamId">): string {
  if (meeting.scope === "general") {
    return "general";
  }
  return meeting.teamId ?? "general";
}

export function WorkProvider({ children }: { children: React.ReactNode }) {
  const [tasksByTeam, setTasksByTeam] = useState<Record<string, Task[]>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowops_tasks");
      if (stored) return JSON.parse(stored);
    }
    return initialTasksByTeam;
  });
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowops_feed_posts");
      if (stored) return JSON.parse(stored);
    }
    return sortByCreatedAtDesc(mockFeedPosts);
  });
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowops_feed_events");
      if (stored) return JSON.parse(stored);
    }
    return sortByCreatedAtDesc(initialFeedEvents);
  });
  const [meetingsByTeam, setMeetingsByTeam] = useState<Record<string, Meeting[]>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowops_meetings");
      if (stored) return JSON.parse(stored);
    }
    return mockMeetingsByTeam;
  });

  useEffect(() => {
    localStorage.setItem("flowops_tasks", JSON.stringify(tasksByTeam));
  }, [tasksByTeam]);

  useEffect(() => {
    localStorage.setItem("flowops_feed_posts", JSON.stringify(feedPosts));
  }, [feedPosts]);

  useEffect(() => {
    localStorage.setItem("flowops_feed_events", JSON.stringify(feedEvents));
  }, [feedEvents]);

  useEffect(() => {
    localStorage.setItem("flowops_meetings", JSON.stringify(meetingsByTeam));
  }, [meetingsByTeam]);

  const addFeedEvent = useCallback((input: AddFeedEventInput) => {
    const createdAt = new Date().toISOString();

    const newEvent: FeedEvent = {
      id: buildId("event"),
      kind: "event",
      teamId: input.teamId ?? null,
      content: input.content,
      author: input.author,
      timestamp: toRelativeTime(createdAt),
      createdAt,
      eventType: input.eventType
    };

    setFeedEvents((previousEvents) => sortByCreatedAtDesc([newEvent, ...previousEvents]));

    // TODO: Send feed event to backend timeline API when available.
  }, []);

  const addFeedPost = useCallback((input: AddFeedPostInput) => {
    const createdAt = new Date().toISOString();

    const newPost: FeedPost = {
      id: buildId("post"),
      kind: "post",
      teamId: input.teamId,
      author: input.author,
      role: input.role,
      content: input.content,
      timestamp: toRelativeTime(createdAt),
      createdAt,
      scope: input.scope,
      likes: 0,
      comments: 0
    };

    setFeedPosts((previousPosts) => sortByCreatedAtDesc([newPost, ...previousPosts]));

    // TODO: Send feed post creation to backend timeline API when available.
  }, []);

  const createTask = useCallback((input: CreateTaskInput): Task => {
    const createdAt = new Date().toISOString();
    const newTask: Task = {
      id: buildId("task"),
      teamId: input.teamId,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      assigneeId: input.assigneeId,
      dueDate: input.dueDate,
      createdAt
    };

    setTasksByTeam((previousTasks) => {
      const teamTasks = previousTasks[input.teamId] ?? [];
      return {
        ...previousTasks,
        [input.teamId]: [...teamTasks, newTask]
      };
    });

    // TODO: Replace this with a backend task creation API call.
    return newTask;
  }, []);

  const updateTask = useCallback((taskId: string, updates: UpdateTaskInput) => {
    setTasksByTeam((previousTasks) => {
      const nextTasksByTeam: Record<string, Task[]> = {};

      for (const [teamId, teamTasks] of Object.entries(previousTasks)) {
        nextTasksByTeam[teamId] = teamTasks.map((task) =>
          task.id === taskId ? { ...task, ...updates, title: updates.title?.trim() || task.title } : task
        );
      }

      return nextTasksByTeam;
    });

    // TODO: Replace this with a backend task update API call.
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasksByTeam((previousTasks) => {
      const nextTasksByTeam: Record<string, Task[]> = {};

      for (const [teamId, teamTasks] of Object.entries(previousTasks)) {
        nextTasksByTeam[teamId] = teamTasks.filter((task) => task.id !== taskId);
      }

      return nextTasksByTeam;
    });

    // TODO: Replace this with a backend task deletion API call.
  }, []);

  const moveTask = useCallback(
    (taskId: string, newStatus: TaskStatus, newIndex: number) => {
      let movedTaskForEvent: Task | null = null;

      for (const teamTasks of Object.values(tasksByTeam)) {
        const foundTask = teamTasks.find((task) => task.id === taskId);
        if (foundTask) {
          movedTaskForEvent = foundTask;
          break;
        }
      }

      setTasksByTeam((previousTasks) => {
        const nextTasksByTeam: Record<string, Task[]> = { ...previousTasks };

        for (const [teamId, teamTasks] of Object.entries(previousTasks)) {
          const currentIndex = teamTasks.findIndex((task) => task.id === taskId);
          if (currentIndex === -1) {
            continue;
          }

          const mutableTasks = [...teamTasks];
          const [activeTask] = mutableTasks.splice(currentIndex, 1);
          const updatedTask: Task = { ...activeTask, status: newStatus };

          const grouped: Record<TaskStatus, Task[]> = {
            todo: [],
            in_progress: [],
            done: []
          };

          for (const task of mutableTasks) {
            grouped[task.status].push(task);
          }

          const destinationColumn = grouped[newStatus];
          const boundedIndex = Math.max(0, Math.min(newIndex, destinationColumn.length));
          destinationColumn.splice(boundedIndex, 0, updatedTask);

          nextTasksByTeam[teamId] = [...grouped.todo, ...grouped.in_progress, ...grouped.done];
          break;
        }

        return nextTasksByTeam;
      });

      if (movedTaskForEvent && movedTaskForEvent.status !== "done" && newStatus === "done") {
        addFeedEvent({
          teamId: movedTaskForEvent.teamId,
          content: `Tarea completada: ${movedTaskForEvent.title}`,
          author: "Sistema",
          eventType: "task_completed"
        });
      }

      // TODO: Replace this with a backend task move API call.
    },
    [addFeedEvent, tasksByTeam]
  );

  const createMeeting = useCallback(
    (input: CreateMeetingInput): Meeting => {
      const { authorName, ...meetingInput } = input;
      const createdAt = new Date().toISOString();

      const normalizedMeetingInput: Omit<Meeting, "id" | "createdAt"> = {
        ...meetingInput,
        scope: meetingInput.scope,
        teamId: meetingInput.scope === "general" ? null : meetingInput.teamId
      };

      const newMeeting: Meeting = {
        ...normalizedMeetingInput,
        id: buildId("meeting"),
        createdAt
      };

      setMeetingsByTeam((previousMeetings) => {
        const bucketKey = getMeetingBucketKey(newMeeting);
        const teamMeetings = previousMeetings[bucketKey] ?? [];
        return {
          ...previousMeetings,
          [bucketKey]: [...teamMeetings, newMeeting]
        };
      });

      addFeedEvent({
        teamId: newMeeting.scope === "general" ? null : newMeeting.teamId,
        content: `Reunion programada (${getMeetingScopeLabel(newMeeting.scope)}): ${newMeeting.title} - ${formatMeetingMoment(newMeeting.start)}`,
        author: authorName ?? "Usuario Demo",
        eventType: "meeting_scheduled"
      });

      // TODO: Replace this with a backend meeting creation API call.
      return newMeeting;
    },
    [addFeedEvent]
  );

  const updateMeeting = useCallback(
    (meetingId: string, patch: UpdateMeetingInput) => {
      const { authorName, ...meetingPatch } = patch;
      let existingMeeting: Meeting | null = null;

      for (const meetings of Object.values(meetingsByTeam)) {
        const found = meetings.find((meeting) => meeting.id === meetingId);
        if (found) {
          existingMeeting = found;
          break;
        }
      }

      if (!existingMeeting) {
        return;
      }

      const updatedMeeting: Meeting = {
        ...existingMeeting,
        ...meetingPatch,
        scope: meetingPatch.scope ?? existingMeeting.scope,
        teamId:
          (meetingPatch.scope ?? existingMeeting.scope) === "general"
            ? null
            : meetingPatch.teamId ?? existingMeeting.teamId
      };

      setMeetingsByTeam((previousMeetings) => {
        const nextMeetingsByTeam: Record<string, Meeting[]> = {};
        const updatedBucketKey = getMeetingBucketKey(updatedMeeting);

        for (const [teamId, teamMeetings] of Object.entries(previousMeetings)) {
          nextMeetingsByTeam[teamId] = teamMeetings.filter((meeting) => meeting.id !== meetingId);
        }

        const destinationMeetings = nextMeetingsByTeam[updatedBucketKey] ?? [];
        nextMeetingsByTeam[updatedBucketKey] = [...destinationMeetings, updatedMeeting];

        return nextMeetingsByTeam;
      });

      addFeedEvent({
        teamId: updatedMeeting.scope === "general" ? null : updatedMeeting.teamId,
        content: `Reunion actualizada (${getMeetingScopeLabel(updatedMeeting.scope)}): ${updatedMeeting.title} - ${formatMeetingMoment(updatedMeeting.start)}`,
        author: authorName ?? "Usuario Demo",
        eventType: "meeting_updated"
      });

      // TODO: Replace this with a backend meeting update API call.
    },
    [addFeedEvent, meetingsByTeam]
  );

  const deleteMeeting = useCallback(
    (meetingId: string, authorName = "Usuario Demo") => {
      let meetingToDelete: Meeting | null = null;

      for (const meetings of Object.values(meetingsByTeam)) {
        const found = meetings.find((meeting) => meeting.id === meetingId);
        if (found) {
          meetingToDelete = found;
          break;
        }
      }

      if (!meetingToDelete) {
        return;
      }

      setMeetingsByTeam((previousMeetings) => {
        const nextMeetingsByTeam: Record<string, Meeting[]> = {};

        for (const [teamId, teamMeetings] of Object.entries(previousMeetings)) {
          nextMeetingsByTeam[teamId] = teamMeetings.filter((meeting) => meeting.id !== meetingId);
        }

        return nextMeetingsByTeam;
      });

      addFeedEvent({
        teamId: meetingToDelete.scope === "general" ? null : meetingToDelete.teamId,
        content: `Reunion cancelada (${getMeetingScopeLabel(meetingToDelete.scope)}): ${meetingToDelete.title}`,
        author: authorName,
        eventType: "meeting_canceled"
      });

      // TODO: Replace this with a backend meeting deletion API call.
    },
    [addFeedEvent, meetingsByTeam]
  );

  const getMeetingsForTeam = useCallback(
    (teamId: string) => {
      const generalMeetings = meetingsByTeam.general ?? [];
      const teamMeetings = meetingsByTeam[teamId] ?? [];
      return [...generalMeetings, ...teamMeetings];
    },
    [meetingsByTeam]
  );

  const value = useMemo<WorkContextValue>(
    () => ({
      tasksByTeam,
      createTask,
      updateTask,
      moveTask,
      deleteTask,
      feedPosts,
      feedEvents,
      meetingsByTeam,
      addFeedPost,
      addFeedEvent,
      createMeeting,
      updateMeeting,
      deleteMeeting,
      getMeetingsForTeam
    }),
    [
      tasksByTeam,
      createTask,
      updateTask,
      moveTask,
      deleteTask,
      feedPosts,
      feedEvents,
      meetingsByTeam,
      addFeedPost,
      addFeedEvent,
      createMeeting,
      updateMeeting,
      deleteMeeting,
      getMeetingsForTeam
    ]
  );

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
}

export function useWorkContext(): WorkContextValue {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error("useWorkContext debe usarse dentro de WorkProvider.");
  }
  return context;
}

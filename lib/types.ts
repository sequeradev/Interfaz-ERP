export type TeamRole = "admin" | "manager" | "member" | "viewer";

export type Team = {
  id: string;
  name: string;
  role: TeamRole;
  memberCount: number;
  description: string;
};

export type User = {
  id: string;
  teamId: string;
  name: string;
  initials: string;
  email: string;
  role: string;
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskActivityType = "started" | "paused" | "completed" | "note";

export type TaskActivity = {
  id: string;
  type: TaskActivityType;
  message: string;
  author: string;
  authorId?: string;
  createdAt: string;
};

export type Task = {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  activity: TaskActivity[];
};

export type Meeting = {
  id: string;
  scope: "general" | "team";
  teamId?: string | null;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  createdById: string;
  createdAt: string;
};

export type FeedScope = "general" | "teams";

export type FeedPost = {
  id: string;
  kind: "post";
  teamId: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  createdAt: string;
  scope: FeedScope;
  likes: number;
  comments: number;
};

export type FeedEvent = {
  id: string;
  kind: "event";
  teamId?: string | null;
  content: string;
  author: string;
  timestamp: string;
  createdAt: string;
  eventType:
    | "task_created"
    | "task_completed"
    | "meeting_scheduled"
    | "meeting_updated"
    | "meeting_canceled"
    | "system";
};

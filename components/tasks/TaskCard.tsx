import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { Task, TaskPriority, User } from "@/lib/types";

type TaskCardProps = {
  task: Task;
  assignee?: User;
  onOpen: () => void;
  isOverdue: boolean;
} & HTMLAttributes<HTMLButtonElement>;

const priorityStyles: Record<TaskPriority, string> = {
  low: "border-line bg-[#f3f7fa] text-text-secondary",
  medium: "border-state-info/25 bg-blue-50 text-state-info",
  high: "border-state-warning/30 bg-orange-50 text-state-warning"
};

function formatPriority(priority: TaskPriority): string {
  if (priority === "low") return "Baja";
  if (priority === "medium") return "Media";
  return "Alta";
}

export function TaskCard({ task, assignee, onOpen, isOverdue, className, ...props }: TaskCardProps) {
  const latestActivity = task.activity[task.activity.length - 1];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-xl border border-line bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lift",
        className
      )}
      {...props}
    >
      <p className="text-lg font-medium text-text-primary">{task.title}</p>

      {latestActivity ? (
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
          {latestActivity.author}: {latestActivity.message}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", priorityStyles[task.priority])}>
          {formatPriority(task.priority)}
        </span>

        {task.dueDate ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-sm font-medium",
              isOverdue ? "bg-red-50 text-state-error" : "bg-[#eef4f8] text-text-secondary"
            )}
          >
            {isOverdue ? "Vencida" : task.dueDate}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {assignee ? (
          <>
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-secondary/15 text-[11px] font-semibold text-brand-secondary"
              aria-hidden="true"
            >
              {assignee.initials}
            </span>
            <span className="text-sm text-text-secondary">{assignee.name}</span>
          </>
        ) : (
          <span className="text-sm text-text-secondary">Sin asignar</span>
        )}
      </div>
    </button>
  );
}

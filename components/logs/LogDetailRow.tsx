"use client";

type LogDetailRowProps = {
  label: string;
  data: Record<string, unknown> | null | undefined;
};

export function LogDetailRow({ label, data }: LogDetailRowProps) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-xs font-semibold text-text-secondary mb-1">{label}</p>
      <pre className="rounded-lg bg-surface2 p-3 text-xs text-text-primary overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

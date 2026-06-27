import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon && (
        <div className="mb-4 text-[var(--color-text-tertiary)]">{icon}</div>
      )}
      <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)] max-w-[280px]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

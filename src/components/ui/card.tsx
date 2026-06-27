import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-[var(--color-bg-elevated)] border border-[var(--color-border-secondary)]",
  elevated:
    "bg-[var(--color-bg-elevated)] border border-[var(--color-border-secondary)] shadow-[var(--shadow-md)]",
  outline: "bg-transparent border border-[var(--color-border-primary)]",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  className,
  variant = "default",
  padding = "md",
  onClick,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)]",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

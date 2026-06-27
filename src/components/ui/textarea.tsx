import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full",
            "px-3 py-2.5",
            "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]",
            "border border-[var(--color-border-primary)]",
            "rounded-[var(--radius-md)]",
            "text-sm leading-relaxed",
            "resize-none",
            "transition-colors duration-[var(--transition-fast)]",
            "placeholder:text-[var(--color-text-tertiary)]",
            "focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
        {hint && (
          <p className="text-xs text-[var(--color-text-tertiary)]">{hint}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

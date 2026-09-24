"use client";

import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
  size?: "sm" | "md";
}

const sizeConfig = {
  sm: { box: "size-3.5", icon: "size-2.5", text: "text-xs" },
  md: { box: "size-4", icon: "size-3", text: "text-sm" },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, indeterminate, size = "md", className, disabled, checked, ...props }, ref) => {
    const id = useId();
    const cfg = sizeConfig[size];
    const isChecked = indeterminate ? false : checked;

    return (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-start gap-2.5 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          disabled={disabled}
          checked={isChecked}
          className="sr-only peer"
          {...props}
        />
        <span
          className={cn(
            "shrink-0 mt-0.5 rounded border-2 flex items-center justify-center",
            cfg.box,
            indeterminate || isChecked
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
              : "border-[var(--color-border-primary)] bg-transparent",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-border-focus)] peer-focus-visible:ring-offset-1",
            "transition-colors duration-150",
          )}
        >
          {indeterminate ? (
            <Minus className={cn(cfg.icon, "text-white")} strokeWidth={3} />
          ) : isChecked ? (
            <Check className={cn(cfg.icon, "text-white")} strokeWidth={3} />
          ) : null}
        </span>
        {(label || description) && (
          <span className="flex flex-col gap-0.5">
            {label && (
              <span className={cn("font-medium text-[var(--color-text-primary)]", cfg.text)}>{label}</span>
            )}
            {description && (
              <span className="text-xs text-[var(--color-text-tertiary)] text-pretty">{description}</span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

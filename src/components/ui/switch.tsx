"use client";

import { forwardRef, type ButtonHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: "sm" | "md";
}

const sizeConfig = {
  sm: { track: "w-8 h-[18px]", thumb: "size-3.5", translate: "translate-x-[14px]" },
  md: { track: "w-10 h-5", thumb: "size-4", translate: "translate-x-5" },
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, description, size = "md", className, disabled, ...props }, ref) => {
    const id = useId();
    const cfg = sizeConfig[size];

    const switchEl = (
      <button
        ref={ref}
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full transition-colors duration-150",
          cfg.track,
          checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-border-focus)] peer-focus-visible:ring-offset-1",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow-sm transition-transform duration-150",
            cfg.thumb,
            checked ? cfg.translate : "translate-x-0.5",
          )}
        />
      </button>
    );

    if (!label && !description) return switchEl;

    return (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-2.5 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {switchEl}
        <span className="flex flex-col gap-0.5">
          {label && <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>}
          {description && (
            <span className="text-xs text-[var(--color-text-tertiary)] text-pretty">{description}</span>
          )}
        </span>
      </label>
    );
  },
);

Switch.displayName = "Switch";

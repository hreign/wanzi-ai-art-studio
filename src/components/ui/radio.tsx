"use client";

import { type ReactNode, createContext, useContext, useId } from "react";
import { cn } from "@/lib/utils";

interface RadioContextValue {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

const RadioContext = createContext<RadioContextValue | null>(null);

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  name?: string;
}

export function RadioGroup({
  value,
  onChange,
  children,
  orientation = "vertical",
  className,
  name,
}: RadioGroupProps) {
  const groupName = name || useId();
  return (
    <RadioContext.Provider value={{ value, onChange, name: groupName }}>
      <div
        role="radiogroup"
        className={cn(
          orientation === "vertical" ? "flex flex-col gap-2" : "flex flex-row gap-4 flex-wrap",
          className,
        )}
      >
        {children}
      </div>
    </RadioContext.Provider>
  );
}

interface RadioProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Radio({ value, label, description, disabled, className }: RadioProps) {
  const ctx = useContext(RadioContext);
  const id = useId();
  if (!ctx) return null;

  const checked = ctx.value === value;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-2.5 cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={ctx.name}
        value={value}
        disabled={disabled}
        checked={checked}
        onChange={() => ctx.onChange(value)}
        className="sr-only peer"
      />
      <span
        className={cn(
          "shrink-0 size-4 mt-0.5 rounded-full border-2",
          checked
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
            : "border-[var(--color-border-primary)] bg-transparent",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-border-focus)] peer-focus-visible:ring-offset-1",
          "transition-colors duration-150",
          "flex items-center justify-center",
        )}
      >
        {checked && <span className="size-1.5 rounded-full bg-white" />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
        {description && (
          <span className="text-xs text-[var(--color-text-tertiary)] text-pretty">{description}</span>
        )}
      </span>
    </label>
  );
}

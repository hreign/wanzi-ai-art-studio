"use client";

import { type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

const sideStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? id : undefined}>{children}</span>
      {visible && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "absolute z-50 pointer-events-none",
            "px-2 py-1 rounded-[var(--radius-sm)]",
            "bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]",
            "text-xs font-medium whitespace-nowrap",
            "shadow-[var(--shadow-md)]",
            sideStyles[side],
            className,
          )}
          style={{ animation: "tooltipEnter 150ms ease-out" }}
        >
          {content}
        </span>
      )}
      <style jsx>{`
        @keyframes tooltipEnter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}

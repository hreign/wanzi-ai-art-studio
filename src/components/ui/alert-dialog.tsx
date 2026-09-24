"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
  className?: string;
}

export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "确认删除",
  cancelText = "取消",
  children,
  className,
}: AlertDialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--color-bg-overlay)]"
        style={{ animation: "alertFadeIn 200ms ease-out" }}
        onClick={onClose}
      />

      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby={description ? "alert-desc" : undefined}
        className={cn(
          "relative w-full max-w-md bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)]",
          "rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)]",
          className,
        )}
        style={{ animation: "alertEnter 200ms cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="flex items-start gap-3 px-6 pt-5">
          <span className="shrink-0 flex size-9 items-center justify-center rounded-full bg-[var(--color-error)]/15">
            <AlertTriangle className="size-4 text-[var(--color-error)]" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 id="alert-title" className="text-base font-semibold text-[var(--color-text-primary)] text-balance">
              {title}
            </h2>
            {description && (
              <p id="alert-desc" className="mt-1 text-sm text-[var(--color-text-secondary)] text-pretty">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="shrink-0 p-1 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {children && <div className="px-6 py-3 text-pretty">{children}</div>}

        <div className="flex items-center justify-end gap-3 px-6 py-4 mt-2 border-t border-[var(--color-border-secondary)]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes alertEnter {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes alertFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

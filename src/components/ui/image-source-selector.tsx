"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Link, Upload, X, ImageIcon } from "lucide-react";

type SourceMode = "none" | "url" | "upload";

interface ImageSourceSelectorProps {
  value: string;
  mode: SourceMode;
  onChange: (mode: SourceMode, value: string) => void;
  disabled?: boolean;
  label?: string;
}

const MODES: { key: SourceMode; label: string; icon: typeof Link }[] = [
  { key: "none", label: "无", icon: ImageIcon },
  { key: "url", label: "公开URL", icon: Link },
  { key: "upload", label: "本地上传", icon: Upload },
];

export function ImageSourceSelector({
  value,
  mode,
  onChange,
  disabled,
  label = "参考图片",
}: ImageSourceSelectorProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onChange("upload", dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange("url", e.target.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    onChange("none", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const handleModeChange = useCallback(
    (newMode: SourceMode) => {
      setPreview(null);
      onChange(newMode, newMode === "none" ? "" : value);
    },
    [onChange, value],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>

      {/* Segmented radio group */}
      <div
        className="flex rounded-[var(--radius-md)] border border-[var(--color-border-primary)] overflow-hidden bg-[var(--color-bg-tertiary)]"
        role="radiogroup"
        aria-label={label}
      >
        {MODES.map(({ key, label: label, icon: Icon }) => {
          const isActive = mode === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => handleModeChange(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]",
                "disabled:opacity-50 disabled:pointer-events-none",
                isActive
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Conditional content */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            disabled={disabled}
            placeholder="输入公开图片 URL…"
            className={cn(
              "flex-1 h-9 px-3 text-sm rounded-[var(--radius-sm)]",
              "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]",
              "border border-[var(--color-border-primary)]",
              "placeholder:text-[var(--color-text-tertiary)]",
              "focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-[var(--transition-fast)]",
            )}
          />
        </div>
      )}

      {mode === "upload" && (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-9 px-3 text-sm rounded-[var(--radius-sm)] cursor-pointer",
              "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]",
              "border border-[var(--color-border-primary)] border-dashed",
              "hover:border-[var(--color-border-focus)]/60 hover:text-[var(--color-text-primary)]",
              "transition-colors duration-[var(--transition-fast)]",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            {preview ? "更换图片" : "选择图片"}
          </label>
          {preview && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="h-9 px-3 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors rounded-[var(--radius-sm)] hover:bg-[var(--color-error)]/10"
              aria-label="清除图片"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Preview */}
      {(mode === "upload" && preview) && (
        <div className="flex items-center gap-3 p-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]">
          <div className="w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0 bg-[var(--color-bg-secondary)]">
            <img
              src={preview}
              alt="预览"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] truncate flex-1">
            已选择本地图片
          </p>
        </div>
      )}
    </div>
  );
}

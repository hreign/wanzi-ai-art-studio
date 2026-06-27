"use client";

import { useState } from "react";
import type { GenerationResult } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { History, Trash2, Video, ImageIcon } from "lucide-react";

interface HistoryPanelProps {
  history: GenerationResult[];
  activeId?: string | null;
  onRemove: (id: string) => void;
  onClear: () => void;
  onSelect: (result: GenerationResult) => void;
}

export function HistoryPanel({ history, activeId, onRemove, onClear, onSelect }: HistoryPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-secondary)]">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--color-text-tertiary)]" aria-hidden="true" />
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">生成历史</h3>
          {history.length > 0 && <Badge variant="accent" size="sm">{history.length}</Badge>}
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" icon={<Trash2 className="h-3 w-3" />} onClick={() => setConfirmClear(true)}>
            清空
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {history.length === 0 ? (
          <EmptyState
            icon={<History className="h-8 w-8" />}
            title="暂无生成记录"
            description="生成图像或视频后会显示在这里"
          />
        ) : (
          <div className="p-2 flex flex-col gap-1.5" role="listbox" aria-label="生成历史列表">
            {history.map((result) => (
              <HistoryItem
                key={result.id}
                result={result}
                active={result.id === activeId}
                onRemove={() => onRemove(result.id)}
                onSelect={() => onSelect(result)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} title="清空历史记录" size="sm">
        <p className="text-sm text-[var(--color-text-secondary)]">
          确定要清空全部&nbsp;{history.length}&nbsp;条生成记录吗？此操作不可撤销。
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" size="md" onClick={() => setConfirmClear(false)}>取消</Button>
          <Button variant="danger" size="md" onClick={() => { onClear(); setConfirmClear(false); }}>清空</Button>
        </div>
      </Dialog>
    </div>
  );
}

interface HistoryItemProps {
  result: GenerationResult;
  active?: boolean;
  onRemove: () => void;
  onSelect: () => void;
}

function HistoryItem({ result, active, onRemove, onSelect }: HistoryItemProps) {
  const isVideo = !!result.videoUrl;
  const thumbnailSrc = result.images?.[0]
    ? result.images[0].url || (result.images[0].b64_json ? `data:image/png;base64,${result.images[0].b64_json}` : undefined)
    : undefined;
  const label = `${isVideo ? "视频" : "图像"}：${result.prompt}`;

  return (
    <Card
      variant="default"
      padding="none"
      className={cn(
        "group overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_64px]",
        "transition-[border-color,background-color,box-shadow] duration-[var(--transition-fast)]",
        active
          ? "border-[var(--color-accent)] shadow-[inset_3px_0_0_0_var(--color-accent)] bg-[var(--color-accent-muted)]/40"
          : "hover:border-[var(--color-border-focus)]/40",
      )}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          role="option"
          aria-selected={active || undefined}
          onClick={onSelect}
          aria-label={label}
          className="flex items-start gap-3 p-2.5 flex-1 min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]"
        >
          {thumbnailSrc ? (
            <div className="w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0 bg-[var(--color-bg-tertiary)]">
              <img
                src={thumbnailSrc}
                alt=""
                width={48}
                height={48}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-[var(--radius-sm)] flex-shrink-0 bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-tertiary)]">
              {isVideo ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--color-text-primary)] truncate">{result.prompt}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums">
                {formatTime(result.createdAt)}
              </span>
              {result.params.size && <Badge variant="default" size="sm">{result.params.size}</Badge>}
              {isVideo && <Badge variant="success" size="sm">视频</Badge>}
              {result.images && result.images.length > 1 && (
                <Badge variant="default" size="sm">{result.images.length}张</Badge>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label="删除此记录"
          className="w-9 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </Card>
  );
}

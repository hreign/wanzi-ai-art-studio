"use client";

import { useState } from "react";
import type { GenerationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { History, Trash2, Video, ImageIcon } from "lucide-react";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  history: GenerationResult[];
  activeId?: string | null;
  onRemove: (id: string) => void;
  onClear: () => void;
  onSelect: (result: GenerationResult) => void;
}

export function HistoryPanel({ open, onClose, history, activeId, onRemove, onClear, onSelect }: HistoryPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="生成历史"
      size="xl"
      footer={
        history.length > 0 ? (
          <Button variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setConfirmClear(true)}>
            清空
          </Button>
        ) : undefined
      }
    >
      <div className="h-[60dvh] overflow-y-auto overscroll-contain -mx-6 -my-4">
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
                onSelect={() => { onSelect(result); onClose(); }}
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
    </Modal>
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

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-[var(--radius-md)] cursor-pointer",
        "border transition-all duration-150",
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]/40"
          : "border-[var(--color-border-secondary)] hover:border-[var(--color-border-focus)]/50 hover:bg-[var(--color-bg-tertiary)]",
      )}
    >
      {thumbnailSrc ? (
        <div className="w-14 h-14 rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0 bg-[var(--color-bg-tertiary)]">
          <img
            src={thumbnailSrc}
            alt=""
            width={56}
            height={56}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-[var(--radius-sm)] flex-shrink-0 bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-tertiary)]">
          {isVideo ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-primary)] truncate">{result.prompt}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums">
            {formatTime(result.createdAt)}
          </span>
          {isVideo && <Badge variant="success" size="sm">视频</Badge>}
          {result.images && result.images.length > 1 && (
            <Badge variant="default" size="sm">{result.images.length}张</Badge>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        aria-label="删除此记录"
        className="shrink-0 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

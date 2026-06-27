"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, ExternalLink, Sparkles } from "lucide-react";
import { getModelConfig, getAvailableProviders, getProviderModels, PROVIDER_LABELS } from "@/config/models";
import type { ProviderId } from "@/types";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  apiKeys: Record<string, string>;
  onSaveKey: (providerId: ProviderId, key: string) => void;
}

export function SettingsDialog({ open, onClose, apiKeys, onSaveKey }: SettingsDialogProps) {
  const [localKeys, setLocalKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalKeys({ ...apiKeys });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // only sync on open, not on every parent re-render

  const providers = getAvailableProviders();

  const handleSave = () => {
    Object.entries(localKeys).forEach(([providerId, key]) => {
      onSaveKey(providerId as ProviderId, key);
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="设置" size="lg">
      <div className="space-y-5">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          每个供应商使用独立的 API Key。Key 仅存储在浏览器本地，不会发送到任何第三方服务。
        </p>

        <div className="space-y-4">
          {providers.map((providerId) => {
            const models = getProviderModels(providerId);
            const hasKey = (localKeys[providerId] || "").length > 0;

            return (
              <div key={providerId} className="p-4 rounded-[var(--radius-md)] border border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{PROVIDER_LABELS[providerId]}</span>
                  <Badge variant={hasKey ? "success" : "warning"} size="sm">
                    {hasKey ? "已设置" : "未设置"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {models.map((modelId) => {
                    const config = getModelConfig(modelId);
                    return (
                      <span key={modelId} className="text-[11px] px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
                        {config?.name || modelId}
                      </span>
                    );
                  })}
                </div>
                <div className="relative">
                  <Input
                    type={showKeys[providerId] ? "text" : "password"}
                    value={localKeys[providerId] || ""}
                    onChange={(e) => setLocalKeys((prev) => ({ ...prev, [providerId]: e.target.value }))}
                    placeholder={`输入 ${PROVIDER_LABELS[providerId]} 的 API Key`}
                    className="pr-10"
                  />
                  <button
                    onClick={() => setShowKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {showKeys[providerId] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Links */}
        <div className="flex flex-wrap gap-4 pt-2 text-xs text-[var(--color-text-tertiary)]">
          <a
            href="https://platform.sensenova.cn/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--color-accent)] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            获取 SenseNova API Key
          </a>
          <a
            href="https://platform.agnes-ai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--color-accent)] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            获取 Agnes API Key
          </a>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border-secondary)]">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
    </Dialog>
  );
}

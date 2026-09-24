"use client";

import { useParams, notFound } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import { VideoGenerator } from "@/components/video-generator/video-generator";
import { useApiKey } from "@/hooks/use-api-key";
import { useHistory } from "@/hooks/use-history";
import type { ModelId, ProviderId, GenerationResult } from "@/types";
import { getModelConfig, getProviderId, getAvailableProviders } from "@/config/models";
import { Key, TriangleAlert } from "lucide-react";

export default function VideoModelPage() {
  const params = useParams<{ modelId: string }>();
  const modelId = params.modelId as ModelId;
  const modelConfig = getModelConfig(modelId);

  if (!modelConfig || modelConfig.category !== "video") {
    notFound();
  }

  const { apiKey, setApiKey } = useApiKey(modelId);
  const { history, add, remove, clear } = useHistory();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSaveKey = useCallback((providerId: ProviderId, key: string) => {
    try {
      localStorage.setItem(`wanzi-ai-art-studio-api-key-${providerId}`, key);
    } catch {}
    if (getProviderId(modelId) === providerId) {
      setApiKey(key);
    }
  }, [modelId, setApiKey]);

  const allApiKeys: Record<string, string> = {};
  getAvailableProviders().forEach((pid) => {
    try {
      allApiKeys[pid] = localStorage.getItem(`wanzi-ai-art-studio-api-key-${pid}`) || "";
    } catch {
      allApiKeys[pid] = "";
    }
  });

  const handleAddHistory = useCallback((result: GenerationResult) => {
    if (result) add(result);
  }, [add]);

  const videoHistory = useMemo(
    () => history.filter((h) => h.modelId === modelId && !!h.videoUrl),
    [history, modelId],
  );

  return (
    <AppShell onSettingsClick={() => setSettingsOpen(true)}>
      {!apiKey && (
        <div className="flex items-center gap-2 px-6 py-2 bg-[var(--color-warning)]/5 border-b border-[var(--color-warning)]/20">
          <TriangleAlert className="h-3.5 w-3.5 text-[var(--color-warning)] flex-shrink-0" />
          <p className="text-xs text-[var(--color-warning)] flex-1">
            请为 <strong>{modelConfig?.name}</strong> 设置 API Key
          </p>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            <Key className="h-3 w-3" />
            去设置
          </button>
        </div>
      )}

      <VideoGenerator
        key={modelId}
        modelId={modelId}
        apiKey={apiKey}
        history={videoHistory}
        onAddHistory={handleAddHistory}
        onRemoveHistory={remove}
        onClearHistory={clear}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKeys={allApiKeys}
        onSaveKey={handleSaveKey}
      />
    </AppShell>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import { ImageGenerator } from "@/components/image-generator/image-generator";
import { VideoGenerator } from "@/components/video-generator/video-generator";
import { useApiKey } from "@/hooks/use-api-key";
import { useHistory } from "@/hooks/use-history";
import type { ModelId, ProviderId, GenerationResult } from "@/types";
import { getModelConfig, getProviderId, getAvailableProviders } from "@/config/models";
import { Key, TriangleAlert } from "lucide-react";

export default function HomePage() {
  const [activeModel, setActiveModel] = useState<ModelId>("sensenova-u1-fast");
  const { apiKey, setApiKey } = useApiKey(activeModel);
  const { history, add, remove, clear } = useHistory();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const modelConfig = getModelConfig(activeModel);
  const isVideo = modelConfig?.category === "video";

  const handleModelChange = useCallback((model: ModelId) => {
    setActiveModel(model);
  }, []);

  const handleSaveKey = useCallback((providerId: ProviderId, key: string) => {
    try {
      localStorage.setItem(`wanzi-ai-art-studio-api-key-${providerId}`, key);
    } catch {}
    if (getProviderId(activeModel) === providerId) {
      setApiKey(key);
    }
  }, [activeModel, setApiKey]);

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

  const imageHistory = useMemo(
    () => history.filter((h) => h.modelId === activeModel && !h.videoUrl),
    [history, activeModel],
  );
  const videoHistory = useMemo(
    () => history.filter((h) => h.modelId === activeModel && !!h.videoUrl),
    [history, activeModel],
  );

  return (
    <AppShell
      onSettingsClick={() => setSettingsOpen(true)}
      activeModel={activeModel}
      onModelChange={handleModelChange}
    >
      {/* API Key Bar */}
      {!apiKey && (
        <div className="flex items-center gap-2 px-6 py-2 bg-[var(--color-warning)]/5 border-b border-[var(--color-warning)]/20">
          <TriangleAlert className="h-3.5 w-3.5 text-[var(--color-warning)] flex-shrink-0" />
          <p className="text-xs text-[var(--color-warning)] flex-1">
            请为 <strong>{modelConfig?.name}</strong> 设置 API Key
          </p>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
          >
            <Key className="h-3 w-3" />
            去设置
          </button>
        </div>
      )}

      {/* Model-specific Generator */}
      {isVideo ? (
        <VideoGenerator
          key={activeModel}
          modelId={activeModel}
          apiKey={apiKey}
          history={videoHistory}
          onAddHistory={handleAddHistory}
          onRemoveHistory={remove}
          onClearHistory={clear}
        />
      ) : (
        <ImageGenerator
          key={activeModel}
          modelId={activeModel}
          apiKey={apiKey}
          history={imageHistory}
          onAddHistory={handleAddHistory}
          onRemoveHistory={remove}
          onClearHistory={clear}
        />
      )}

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKeys={allApiKeys}
        onSaveKey={handleSaveKey}
      />
    </AppShell>
  );
}

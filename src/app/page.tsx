"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MODEL_REGISTRY, getProviderId, PROVIDER_LABELS, getAvailableProviders } from "@/config/models";
import type { ModelId, ProviderId } from "@/types";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import { Image, Video, Key, ArrowRight, Sparkles, Settings } from "lucide-react";

export default function HomePage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadKeys = useCallback(() => {
    const keys: Record<string, string> = {};
    getAvailableProviders().forEach((pid) => {
      try {
        keys[pid] = localStorage.getItem(`wanzi-ai-art-studio-api-key-${pid}`) || "";
      } catch {
        keys[pid] = "";
      }
    });
    setApiKeys(keys);
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleSaveKey = useCallback((providerId: ProviderId, key: string) => {
    try {
      localStorage.setItem(`wanzi-ai-art-studio-api-key-${providerId}`, key);
    } catch {}
    loadKeys();
  }, [loadKeys]);

  const imageModels = ["sensenova-u1.5-lite", "sensenova-u1.5-fast", "agnes-image-2.5-flash"]
    .map((id) => MODEL_REGISTRY[id])
    .filter(Boolean);
  const videoModels = ["agnes-video-2.5-flash"]
    .map((id) => MODEL_REGISTRY[id])
    .filter(Boolean);
  const hasKey = (modelId: ModelId) => !!apiKeys[getProviderId(modelId)];

  return (
    <div className="min-h-dvh bg-[var(--color-bg-primary)]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--color-accent)] mb-3">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] text-balance">
            Wanzi AI Art Studio
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] text-pretty">
            集成多种 AI 模型的图像与视频生成工坊
          </p>
          <button
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-2 mt-5 px-4 h-9 rounded-[var(--radius-md)] border border-[var(--color-border-secondary)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-all cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            设置 API Key
          </button>
        </div>

        {loaded && (!apiKeys.sensenova || !apiKeys.agnes) && (
          <div className="mb-8 p-4 rounded-[var(--radius-md)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[var(--color-warning)] flex-shrink-0" />
                <p className="text-sm text-[var(--color-warning)]">
                  以下供应商尚未配置 API Key：
                  {!apiKeys.sensenova && <span className="ml-1 font-medium">SenseNova</span>}
                  {!apiKeys.sensenova && !apiKeys.agnes && <span>、</span>}
                  {!apiKeys.agnes && <span className="ml-1 font-medium">Agnes</span>}
                </p>
              </div>
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-1 px-3 h-8 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
              >
                <Key className="h-3 w-3" />
                去设置
              </button>
            </div>
          </div>
        )}

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Image className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">图像生成</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {imageModels.map((model) => {
              const provider = getProviderId(model.id as ModelId);
              const keySet = hasKey(model.id as ModelId);
              return (
                <Link
                  key={model.id}
                  href={`/image/${model.id}`}
                  className="group p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-secondary)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg-secondary)] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{model.name}</h3>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)] line-clamp-2">{model.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">{PROVIDER_LABELS[provider]}</span>
                        {loaded && !keySet && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-warning)]">
                            <Key className="h-3 w-3" />未设置
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">视频生成</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videoModels.map((model) => {
              const provider = getProviderId(model.id as ModelId);
              const keySet = hasKey(model.id as ModelId);
              return (
                <Link
                  key={model.id}
                  href={`/video/${model.id}`}
                  className="group p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-secondary)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg-secondary)] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{model.name}</h3>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)] line-clamp-2">{model.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">{PROVIDER_LABELS[provider]}</span>
                        {loaded && !keySet && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-warning)]">
                            <Key className="h-3 w-3" />未设置
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKeys={apiKeys}
        onSaveKey={handleSaveKey}
      />
    </div>
  );
}

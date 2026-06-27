"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageGrid } from "./image-grid";
import { PromptInput } from "./prompt-input";
import { HistoryPanel } from "./history-panel";
import { Select } from "@/components/ui/select";
import { ImageSourceSelector } from "@/components/ui/image-source-selector";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { useHistorySelection } from "@/hooks/use-history-selection";
import type { GenerationParams, GenerationResult, ResponseFormat, ModelId } from "@/types";
import { getModelConfig } from "@/config/models";
import { Sparkles, AlertCircle, ImageIcon, History } from "lucide-react";

interface ImageGeneratorProps {
  modelId: ModelId;
  apiKey: string;
  history: GenerationResult[];
  onAddHistory: (result: GenerationResult) => void;
  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;
}

export function ImageGenerator({
  modelId,
  apiKey,
  history,
  onAddHistory,
  onRemoveHistory,
  onClearHistory,
}: ImageGeneratorProps) {
  const modelConfig = getModelConfig(modelId)!;
  const { isGenerating, error, currentResult, generate, clearError } = useImageGeneration(modelId);
  const { displayedResult, selectedHistoryId, select: selectHistory, reset: resetHistorySelection } = useHistorySelection(history, currentResult);

  const [prompt, setPrompt] = useState("");
  function loadImageParams(mid: ModelId) {
    try {
      const saved = localStorage.getItem(`wanzi-ai-art-studio-params-${mid}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  }

  const _initial = loadImageParams(modelId);
  const [size, setSize] = useState<string>(_initial.size || (modelConfig.defaults.size as string));
  const [n, setN] = useState(_initial.n || (modelConfig.defaults.n as number) || 1);
  const [responseFormat, setResponseFormat] = useState<ResponseFormat>(
    _initial.responseFormat || (modelConfig.defaults.response_format as ResponseFormat) || "url",
  );
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"none" | "url" | "upload">("none");
  const [showHistory, setShowHistory] = useState(false);

  const hasImg2Img = modelConfig.capabilities.includes("image-to-image");

  // Persist params on change
  const prevParamsRef = useRef({ modelId, size, n, responseFormat });
  useEffect(() => {
    console.log("Persisting params for model:", modelId, "size:", size, "n:", n, "responseFormat:", responseFormat);
    const prev = prevParamsRef.current;
    if (prev.modelId !== modelId) {
      localStorage.setItem(`wanzi-ai-art-studio-params-${prev.modelId}`, JSON.stringify({ size: prev.size, n: prev.n, responseFormat: prev.responseFormat }));
    }
    prevParamsRef.current = { modelId, size, n, responseFormat };
    localStorage.setItem(`wanzi-ai-art-studio-params-${modelId}`, JSON.stringify({ size, n, responseFormat }));
  }, [modelId, size, n, responseFormat]);

  const handleGenerate = useCallback(async () => {
    resetHistorySelection();
    const params: GenerationParams = {
      model: modelId,
      prompt,
      size,
      n,
    };

    if (modelId === "agnes-image-2.1-flash") {
      if (imageMode === "url" && imageUrl.trim()) {
        params.image = imageUrl.trim();
      } else if (imageMode === "upload" && imageUrl) {
        params.image = imageUrl;
      }
      if (responseFormat) {
        const extraBody: Record<string, unknown> = { response_format: responseFormat };
        if (imageMode === "url" && imageUrl.trim()) {
          extraBody.image = [imageUrl.trim()];
        } else if (imageMode === "upload" && imageUrl) {
          extraBody.image = [imageUrl];
        }
        params.extra_body = extraBody;
      }
    } else {
      params.response_format = responseFormat;
    }

    const result = await generate(params, apiKey);
    if (result) {
      onAddHistory(result);
    }
  }, [modelId, prompt, size, n, responseFormat, imageUrl, imageMode, generate, onAddHistory, apiKey, resetHistorySelection]);

  const isViewingHistory = !!selectedHistoryId && displayedResult?.id === selectedHistoryId;

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-[var(--color-border-secondary)] bg-[var(--color-bg-elevated)]">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">图像生成</h2>
          <Badge variant="accent" size="md">{modelConfig.name}</Badge>
        </div>
        <Button
          variant={showHistory ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowHistory((v) => !v)}
          aria-pressed={showHistory}
          icon={<History className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          历史记录
          {history.length > 0 && <Badge variant="default" size="sm">{history.length}</Badge>}
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Input Panel */}
        <div className="flex flex-col border-r border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)] flex-1 min-w-[420px]">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <PromptInput value={prompt} onChange={setPrompt} disabled={isGenerating} />

            {/* Image Source (Agnes Image img2img) */}
            {hasImg2Img && (
              <ImageSourceSelector
                label="参考图片"
                value={imageUrl}
                mode={imageMode}
                onChange={(mode, val) => {
                  setImageMode(mode);
                  setImageUrl(val);
                }}
                disabled={isGenerating}
              />
            )}

            {/* Params */}
            <Card variant="outline" padding="md">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">生成参数</h3>

                {/* Size */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--color-text-tertiary)]">图像尺寸</label>
                  <Select
                    options={modelConfig.sizes.map((s) => ({ value: s, label: formatSizeLabel(s) }))}
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                {/* N - only for SenseNova */}
                {modelId === "sensenova-u1-fast" && modelConfig.maxN > 1 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-tertiary)]">
                      生成数量
                      <span className="ml-1.5 text-[var(--color-text-tertiary)]">(1-{modelConfig.maxN})</span>
                    </label>
                    <Select
                      options={Array.from({ length: modelConfig.maxN }, (_, i) => ({
                        value: String(i + 1),
                        label: `${i + 1} 张`,
                      }))}
                      value={String(n)}
                      onChange={(e) => setN(Number(e.target.value))}
                      disabled={isGenerating}
                    />
                  </div>
                )}

                {/* Response Format */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--color-text-tertiary)]">返回格式</label>
                  <Select
                    options={modelConfig.responseFormats.map((f) => ({
                      value: f,
                      label: f === "url" ? "URL 链接" : "Base64 编码",
                    }))}
                    value={responseFormat}
                    onChange={(e) => setResponseFormat(e.target.value as ResponseFormat)}
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </Card>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-[var(--radius-md)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
                <AlertCircle className="h-4 w-4 text-[var(--color-error)] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-error)]">{error}</p>
                </div>
                <button onClick={clearError} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-error)]">×</button>
              </div>
            )}

            {/* API Key Warning */}
            {!apiKey && (
              <div className="flex items-start gap-2.5 p-3 rounded-[var(--radius-md)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20">
                <AlertCircle className="h-4 w-4 text-[var(--color-warning)] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[var(--color-warning)]">请先在设置中配置此模型的 API Key</p>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="p-5 pt-0">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={isGenerating}
              disabled={!prompt.trim() || !apiKey || isGenerating}
              onClick={handleGenerate}
              icon={!isGenerating ? <Sparkles className="h-4 w-4" /> : undefined}
            >
              {isGenerating ? "生成中…" : "开始生成"}
            </Button>
          </div>
        </div>

        {/* Right: Result */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bg-primary)] h-[calc(100vh-56px)]">
          {displayedResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={isViewingHistory ? "default" : "success"} size="sm">
                  {isViewingHistory ? "历史记录" : "已生成"}
                </Badge>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {displayedResult.images?.length || 0} 张 · {displayedResult.params.size}
                </span>
              </div>
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)]">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{displayedResult.prompt}</p>
              </div>
              {displayedResult.images && (
                <ImageGrid images={displayedResult.images} prompt={displayedResult.prompt} />
              )}
            </div>
          ) : history.length > 0 ? (
            <EmptyState
              icon={<History className="h-8 w-8" />}
              title="选择历史记录查看"
              description="点击右上角「历史记录」浏览之前的生成结果"
            />
          ) : (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="等待生成"
              description="在左侧输入提示词并点击「开始生成」，AI 图像将在此展示"
            />
          )}
        </div>
        {/* History (3rd column) */}
        {showHistory && (
          <div className="w-[320px] min-w-[320px] border-l border-[var(--color-border-secondary)]">
            <HistoryPanel
              history={history}
              onRemove={onRemoveHistory}
              onClear={onClearHistory}
              onSelect={selectHistory}
              activeId={selectedHistoryId}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function formatSizeLabel(size: string): string {
  const [w, h] = size.split("x");
  const ratio = Number(w) / Number(h);
  let label = `${w} × ${h}`;
  if (Math.abs(ratio - 1) < 0.01) label += " (1:1)";
  else if (Math.abs(ratio - 1.5) < 0.01) label += " (3:2)";
  else if (Math.abs(ratio - 2 / 3) < 0.01) label += " (2:3)";
  else if (Math.abs(ratio - 1.78) < 0.01) label += " (16:9)";
  else if (Math.abs(ratio - 0.67) < 0.01) label += " (2:3)";
  return label;
}

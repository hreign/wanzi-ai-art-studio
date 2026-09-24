"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ImageSourceSelector } from "@/components/ui/image-source-selector";
import { EmptyState } from "@/components/ui/empty-state";
import { HistoryPanel } from "@/components/image-generator/history-panel";
import { PromptInput } from "@/components/image-generator/prompt-input";
import { useVideoGeneration } from "@/hooks/use-video-generation";
import { useHistorySelection } from "@/hooks/use-history-selection";
import type { GenerationParams, GenerationResult, ModelId } from "@/types";
import { getModelConfig } from "@/config/models";
import { Modal } from "@/components/ui/modal";
import { Video, AlertCircle, Play, Loader2, History, Info } from "lucide-react";

interface VideoGeneratorProps {
  modelId: ModelId;
  apiKey: string;
  history: GenerationResult[];
  onAddHistory: (result: GenerationResult) => void;
  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;
}

const FRAME_OPTIONS = [
  { value: "81", label: "81 帧 (~3秒)" },
  { value: "121", label: "121 帧 (~5秒)" },
  { value: "161", label: "161 帧 (~7秒)" },
  { value: "241", label: "241 帧 (~10秒)" },
  { value: "441", label: "441 帧 (~18秒)" },
];

const FRAME_RATE_OPTIONS = [
  { value: "16", label: "16 fps" },
  { value: "24", label: "24 fps" },
  { value: "30", label: "30 fps" },
  { value: "60", label: "60 fps" },
];

const SIZE_OPTIONS = [
  { value: "1152x768", label: "1152 × 768 (3:2)" },
  { value: "1280x768", label: "1280 × 768 (16:9)" },
  { value: "768x1152", label: "768 × 1152 (2:3)" },
  { value: "1024x1024", label: "1024 × 1024 (1:1)" },
];

const ASPECT_RATIO_OPTIONS = [
  { value: "16:9", label: "16:9 横版" },
  { value: "9:16", label: "9:16 竖版" },
  { value: "1:1", label: "1:1 方形" },
  { value: "4:3", label: "4:3 传统" },
  { value: "3:4", label: "3:4 竖版" },
  { value: "21:9", label: "21:9 超宽" },
];

const SECONDS_OPTIONS = [
  { value: "4", label: "4 秒" },
  { value: "5", label: "5 秒" },
  { value: "8", label: "8 秒" },
  { value: "10", label: "10 秒" },
  { value: "12", label: "12 秒" },
];

export function VideoGenerator({
  modelId,
  apiKey,
  history,
  onAddHistory,
  onRemoveHistory,
  onClearHistory,
}: VideoGeneratorProps) {
  const modelConfig = getModelConfig(modelId)!;
  const isFlashVideo = modelId === "agnes-video-2.5-flash";
  const { isGenerating, isPolling, error, currentResult, videoStatus, progress, generate, clearError } = useVideoGeneration(modelId);
  const { displayedResult, selectedHistoryId, select: selectHistory, reset: resetHistorySelection } = useHistorySelection(history, currentResult);
  const lastAddedId = useRef<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"none" | "url" | "upload">("none");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  function loadVideoParams(mid: ModelId) {
    try {
      const saved = localStorage.getItem(`wanzi-ai-art-studio-params-${mid}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  }

  const _vinitial = loadVideoParams(modelId);
  const [size, setSize] = useState(_vinitial.size || "1152x768");
  const [frameCount, setFrameCount] = useState(_vinitial.frameCount || "121");
  const [frameRate, setFrameRate] = useState(_vinitial.frameRate || "24");
  const [aspectRatio, setAspectRatio] = useState(_vinitial.aspectRatio || "16:9");
  const [seconds, setSeconds] = useState(_vinitial.seconds || "5");
  const [seed, setSeed] = useState(_vinitial.seed || "");
  const [negativePrompt, setNegativePrompt] = useState(_vinitial.negativePrompt || "");

  // Persist params on change (also saves prev model's params on model switch)
  const prevVParamsRef = useRef({ modelId, size, frameCount, frameRate, aspectRatio, seconds, seed, negativePrompt });
  useEffect(() => {
    const prev = prevVParamsRef.current;
    if (prev.modelId !== modelId) {
      localStorage.setItem(`wanzi-ai-art-studio-params-${prev.modelId}`, JSON.stringify({
        size: prev.size, frameCount: prev.frameCount, frameRate: prev.frameRate,
        aspectRatio: prev.aspectRatio, seconds: prev.seconds,
        seed: prev.seed, negativePrompt: prev.negativePrompt,
      }));
    }
    prevVParamsRef.current = { modelId, size, frameCount, frameRate, aspectRatio, seconds, seed, negativePrompt };
    localStorage.setItem(`wanzi-ai-art-studio-params-${modelId}`, JSON.stringify({ size, frameCount, frameRate, aspectRatio, seconds, seed, negativePrompt }));
  }, [modelId, size, frameCount, frameRate, aspectRatio, seconds, seed, negativePrompt]);

  const [width, height] = size.split("x").map(Number);

  const handleGenerate = useCallback(async () => {
    resetHistorySelection();

    const params: GenerationParams = { model: modelId, prompt };

    if (isFlashVideo) {
      params.extra_body = { mode: "text", seconds, aspect_ratio: aspectRatio };
    } else {
      params.width = width;
      params.height = height;
      params.num_frames = Number(frameCount);
      params.frame_rate = Number(frameRate);
    }

    if (imageMode === "url" && imageUrl.trim()) {
      params.image = imageUrl.trim();
    } else if (imageMode === "upload" && imageUrl) {
      params.image = imageUrl;
    }

    if (seed) {
      params.seed = Number(seed);
    }

    if (negativePrompt.trim()) {
      params.negative_prompt = negativePrompt;
    }

    const result = await generate(params, apiKey);
    if (result) {
      lastAddedId.current = result.id;
      onAddHistory(result);
    }
  }, [modelId, prompt, imageUrl, imageMode, width, height, frameCount, frameRate, aspectRatio, seconds, seed, negativePrompt, isFlashVideo, generate, apiKey, onAddHistory, resetHistorySelection]);

  const isBusy = isGenerating || isPolling;

  // Save polling-completed results to history
  useEffect(() => {
    if (currentResult && currentResult.id !== lastAddedId.current) {
      lastAddedId.current = currentResult.id;
      onAddHistory(currentResult);
    }
  }, [currentResult, onAddHistory]);

  const isViewingHistory = !!selectedHistoryId && displayedResult?.id === selectedHistoryId;
  const showResult = !!displayedResult?.videoUrl;

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-[var(--color-border-secondary)] bg-[var(--color-bg-elevated)]">
        <div className="flex items-center gap-3">
          <Video className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">视频生成</h2>
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
        <div className="flex flex-col border-r border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)] flex-[4] min-w-[420px]">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              disabled={isBusy}
              placeholder="描述你想生成的视频内容… 例如：一只猫在海滩上行走，日落时分，电影级画面"
              hint="描述主体动作、镜头运动、场景氛围，越详细效果越好"
            />

            {/* Image Source (optional, for img2video) */}
            <ImageSourceSelector
              label="参考图片"
              value={imageUrl}
              mode={imageMode}
              onChange={(mode, val) => {
                setImageMode(mode);
                setImageUrl(val);
              }}
              disabled={isBusy}
            />

            {/* Video Params */}
            <Card variant="outline" padding="md">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">视频参数</h3>

                <div className="grid grid-cols-2 gap-4">
                  {isFlashVideo ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--color-text-tertiary)]">画面尺寸</label>
                        <div className="h-9 flex items-center px-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] rounded-[var(--radius-sm)] border border-[var(--color-border-primary)]">
                          720P
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--color-text-tertiary)]">宽高比</label>
                        <Select
                          options={ASPECT_RATIO_OPTIONS}
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value)}
                          disabled={isBusy}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--color-text-tertiary)]">视频时长</label>
                        <Select
                          options={SECONDS_OPTIONS}
                          value={seconds}
                          onChange={(e) => setSeconds(e.target.value)}
                          disabled={isBusy}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--color-text-tertiary)]">画面尺寸</label>
                        <Select
                          options={SIZE_OPTIONS}
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          disabled={isBusy}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--color-text-tertiary)]">帧数 / 时长</label>
                        <Select
                          options={FRAME_OPTIONS}
                          value={frameCount}
                          onChange={(e) => setFrameCount(e.target.value)}
                          disabled={isBusy}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--color-text-tertiary)]">帧率</label>
                        <Select
                          options={FRAME_RATE_OPTIONS}
                          value={frameRate}
                          onChange={(e) => setFrameRate(e.target.value)}
                          disabled={isBusy}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--color-text-tertiary)]">预估时长</label>
                        <div className="h-9 flex items-center px-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] rounded-[var(--radius-sm)] border border-[var(--color-border-primary)]">
                          {Math.round(Number(frameCount) / Number(frameRate) * 10) / 10} 秒
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors text-left"
                >
                  {showAdvanced ? "收起" : "展开"}高级参数
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <Input
                      label="随机种子 (seed)"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="留空随机"
                      disabled={isBusy}
                    />
                    <Input
                      label="反向提示词"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="需要避免的内容"
                      disabled={isBusy}
                    />
                  </div>
                )}
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

            {/* Polling Status */}
            {isPolling && (
              <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">视频生成中</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    {videoStatus === "queued" ? "任务排队中…" : "正在渲染视频…"} {progress > 0 && `(${progress}%)`}
                  </p>
                </div>
                <div className="w-12 h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="p-5 pt-0">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={isBusy}
              disabled={!prompt.trim() || !apiKey || isBusy}
              onClick={handleGenerate}
              icon={!isBusy ? <Play className="h-4 w-4" /> : undefined}
            >
              {isGenerating ? "创建任务…" : isPolling ? "等待生成…" : "生成视频"}
            </Button>
          </div>
        </div>

        {/* Right: Result */}
        <div className="flex-[3] overflow-y-auto p-6 bg-[var(--color-bg-primary)] min-w-[560px]">
          {showResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={isViewingHistory ? "default" : "success"} size="sm">
                  {isViewingHistory ? "历史记录" : "生成完成"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Info className="h-3.5 w-3.5" />}
                  onClick={() => setShowDetail(true)}
                >
                  详细参数
                </Button>
              </div>
              <div className="rounded-[var(--radius-md)] overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video
                  src={displayedResult.videoUrl}
                  controls
                  className="w-full h-full"
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
            </div>
          ) : history.length > 0 ? (
            <EmptyState
              icon={<History className="h-8 w-8" />}
              title="选择历史记录查看"
              description="点击右上角「历史记录」浏览之前的生成结果"
            />
          ) : (
            <EmptyState
              icon={<Video className="h-8 w-8" />}
              title="等待生成"
              description="在左侧输入提示词并点击「生成视频」，AI 视频将在此展示"
            />
          )}
        </div>
      </div>

      {/* History Modal */}
      <HistoryPanel
        open={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onRemove={onRemoveHistory}
        onClear={onClearHistory}
        onSelect={selectHistory}
        activeId={selectedHistoryId}
      />

      {/* Detail Modal */}
      <Modal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="生成详情"
        size="lg"
      >
        {displayedResult && (
          <div className="space-y-4 max-h-[70dvh] overflow-y-auto">
            <div>
              <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">提示词</h4>
              <div className="max-h-[7.5rem] overflow-y-auto p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)]">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {displayedResult.prompt}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">模型</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">{modelConfig.name}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">画面尺寸</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {isFlashVideo ? "720P" : (displayedResult.params.size || "—")}
                </p>
              </div>
              {isFlashVideo ? (
                <>
                  <div>
                    <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">宽高比</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {String((displayedResult.params.extra_body as Record<string, unknown>)?.aspect_ratio || "16:9")}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">视频时长</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {String((displayedResult.params.extra_body as Record<string, unknown>)?.seconds || "5")} 秒
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">帧数</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">{displayedResult.params.num_frames || "—"} 帧</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">帧率</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">{displayedResult.params.frame_rate || "—"} fps</p>
                  </div>
                </>
              )}
              <div>
                <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">生成时间</h4>
                <p className="text-sm text-[var(--color-text-secondary)] tabular-nums">
                  {new Date(displayedResult.createdAt).toLocaleString("zh-CN")}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

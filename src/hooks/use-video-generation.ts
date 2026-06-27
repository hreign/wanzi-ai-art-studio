"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GenerationParams, GenerationResult, ModelId } from "@/types";
import { createVideoTask, pollVideoResult, VideoGenerationError } from "@/services/video-generation";
import { generateId } from "@/lib/utils";

interface VideoGenerationState {
  isGenerating: boolean;
  isPolling: boolean;
  error: string | null;
  currentResult: GenerationResult | null;
  videoStatus: string;
  progress: number;
}

export function useVideoGeneration(modelId: ModelId) {
  const [state, setState] = useState<VideoGenerationState>({
    isGenerating: false,
    isPolling: false,
    error: null,
    currentResult: null,
    videoStatus: "",
    progress: 0,
  });
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoIdRef = useRef<string>("");

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const generate = useCallback(
    async (params: GenerationParams, apiKey: string): Promise<GenerationResult | null> => {
      setState({
        isGenerating: true,
        isPolling: false,
        error: null,
        currentResult: null,
        videoStatus: "queued",
        progress: 0,
      });

      let taskResponse;
      try {
        taskResponse = await createVideoTask(modelId, params, apiKey);
        videoIdRef.current = taskResponse.video_id;
      } catch (error) {
        const message =
          error instanceof VideoGenerationError
            ? error.message
            : error instanceof Error
              ? error.message
              : "创建视频任务失败";
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: message,
          videoStatus: "failed",
        }));
        return null;
      }

      if (taskResponse.status === "completed") {
        const result: GenerationResult = {
          id: taskResponse.video_id || generateId(),
          prompt: params.prompt,
          params,
          videoUrl: taskResponse.video_url || taskResponse.remixed_from_video_id || "",
          createdAt: Date.now(),
          modelId,
          status: "completed",
        };
        setState({
          isGenerating: false,
          isPolling: false,
          error: null,
          currentResult: result,
          videoStatus: "completed",
          progress: 100,
        });
        return result;
      }

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        isPolling: true,
        videoStatus: taskResponse.status,
        progress: taskResponse.progress || 0,
      }));

      const id = taskResponse.video_id;
      pollingRef.current = setInterval(async () => {
        try {
          const polled = await pollVideoResult(modelId, id, apiKey);
          setState((prev) => ({
            ...prev,
            videoStatus: polled.status,
            progress: polled.progress || prev.progress,
          }));

          if (polled.status === "completed") {
            stopPolling();
            const result: GenerationResult = {
              id: polled.video_id || crypto.randomUUID(),
              prompt: params.prompt,
              params,
              videoUrl: polled.video_url || polled.remixed_from_video_id || "",
              createdAt: Date.now(),
              modelId,
              status: "completed",
            };
            setState({
              isGenerating: false,
              isPolling: false,
              error: null,
              currentResult: result,
              videoStatus: "completed",
              progress: 100,
            });
            return { ...result };
          }

          if (polled.status === "failed") {
            stopPolling();
            const errorMsg = typeof polled.error === "string" ? polled.error : "视频生成失败";
            setState((prev) => ({
              ...prev,
              isPolling: false,
              error: errorMsg,
              videoStatus: "failed",
            }));
          }
        } catch {
          // Continue polling on transient errors
        }
      }, 5000);

      return null;
    },
    [modelId, stopPolling],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    stopPolling();
    setState({
      isGenerating: false,
      isPolling: false,
      error: null,
      currentResult: null,
      videoStatus: "",
      progress: 0,
    });
  }, [stopPolling]);

  return { ...state, generate, clearError, clearResult };
}

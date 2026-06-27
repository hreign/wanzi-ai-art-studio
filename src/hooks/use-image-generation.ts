"use client";

import { useCallback, useState } from "react";
import type { GenerationParams, GenerationResult, ModelId } from "@/types";
import { generateImages, ImageGenerationError } from "@/services/image-generation";

interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  currentResult: GenerationResult | null;
}

export function useImageGeneration(modelId: ModelId) {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    currentResult: null,
  });

  const generate = useCallback(
    async (params: GenerationParams, apiKey: string): Promise<GenerationResult | null> => {
      setState({ isGenerating: true, error: null, currentResult: null });

      try {
        const { images, id } = await generateImages(modelId, params, apiKey);
        const result: GenerationResult = {
          id,
          prompt: params.prompt,
          params,
          images,
          createdAt: Date.now(),
          modelId,
        };
        setState({ isGenerating: false, error: null, currentResult: result });
        return result;
      } catch (error) {
        const message =
          error instanceof ImageGenerationError
            ? error.message
            : error instanceof Error
              ? error.message
              : "生成失败，请稍后重试";
        setState({ isGenerating: false, error: message, currentResult: null });
        return null;
      }
    },
    [modelId],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState((prev) => ({ ...prev, currentResult: null }));
  }, []);

  return { ...state, generate, clearError, clearResult };
}

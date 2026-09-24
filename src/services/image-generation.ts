import type { GenerationParams, GeneratedImage, ModelId } from "@/types";
import { generateId } from "@/lib/utils";

export class ImageGenerationError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ImageGenerationError";
  }
}

function isSenseNovaEditModel(modelId: ModelId): boolean {
  return modelId === "sensenova-u1.5-lite" || modelId === "sensenova-u1.5-fast";
}

function buildRequestBody(modelId: ModelId, params: GenerationParams): Record<string, unknown> {
  if (modelId === "agnes-image-2.5-flash") {
    const body: Record<string, unknown> = {
      model: modelId,
      prompt: params.prompt,
      size: params.size,
    };
    if (params.image) {
      body.image = Array.isArray(params.image) ? params.image : [params.image];
    }
    if (params.return_base64) {
      body.return_base64 = true;
    }
    if (params.extra_body && Object.keys(params.extra_body).length > 0) {
      const { ratio, ...rest } = params.extra_body as Record<string, unknown>;
      if (ratio) body.ratio = ratio;
      if (Object.keys(rest).length > 0) body.extra_body = rest;
    }
    return body;
  }

  if (isSenseNovaEditModel(modelId) && params.image) {
    const imageVal = Array.isArray(params.image) ? params.image[0] : params.image;
    const body: Record<string, unknown> = {
      model: modelId,
      images: [{ image_url: imageVal }],
      prompt: params.prompt,
      size: params.size || "auto",
      response_format: params.response_format || "url",
    };
    if (params.extra_body && Object.keys(params.extra_body).length > 0) {
      Object.assign(body, params.extra_body);
    }
    return body;
  }

  const body: Record<string, unknown> = {
    model: modelId,
    prompt: params.prompt,
    size: params.size || "1024x1024",
    n: params.n || 1,
    response_format: params.response_format || "url",
  };
  if (params.extra_body && Object.keys(params.extra_body).length > 0) {
    Object.assign(body, params.extra_body);
  }
  return body;
}

export async function generateImages(
  modelId: ModelId,
  params: GenerationParams,
  apiKey: string,
): Promise<{ images: GeneratedImage[]; id: string }> {
  if (!apiKey.trim()) {
    throw new ImageGenerationError("请先设置 API Key", undefined, "MISSING_API_KEY");
  }

  if (!params.prompt.trim()) {
    throw new ImageGenerationError("请输入提示词", undefined, "EMPTY_PROMPT");
  }

  const body = buildRequestBody(modelId, params);
  const useEdit = isSenseNovaEditModel(modelId) && !!params.image;

  let response: Response;
  try {
    response = await fetch("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelId, body, apiKey, useEdit }),
    });
  } catch (error) {
    throw new ImageGenerationError(
      `网络请求失败: ${error instanceof Error ? error.message : "未知错误"}`,
      undefined, "NETWORK_ERROR",
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let errorMessage = `API 请求失败 (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new ImageGenerationError(errorMessage, response.status, `HTTP_${response.status}`);
  }

  let data: { created?: number; data?: GeneratedImage[] };
  try {
    data = await response.json();
  } catch {
    throw new ImageGenerationError("解析响应数据失败", undefined, "PARSE_ERROR");
  }

  if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
    throw new ImageGenerationError("API 返回了空数据", undefined, "EMPTY_RESPONSE");
  }

  return {
    images: data.data,
    id: generateId(),
  };
}

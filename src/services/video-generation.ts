import type { GenerationParams, ModelId } from "@/types";

export class VideoGenerationError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "VideoGenerationError";
  }
}

export interface VideoTaskResponse {
  id?: string;
  task_id?: string;
  video_id: string;
  video_url?: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  progress?: number;
  created_at?: number;
  seconds?: string;
  size?: string;
  remixed_from_video_id?: string;
  error?: string | null;
}

export async function createVideoTask(
  modelId: ModelId,
  params: GenerationParams,
  apiKey: string,
): Promise<VideoTaskResponse> {
  if (!apiKey.trim()) {
    throw new VideoGenerationError("请先设置 API Key", undefined, "MISSING_API_KEY");
  }

  if (!params.prompt.trim()) {
    throw new VideoGenerationError("请输入提示词", undefined, "EMPTY_PROMPT");
  }

  const extra = (params.extra_body || {}) as Record<string, unknown>;
  const body: Record<string, unknown> = {
    model: modelId,
    prompt: params.prompt,
    mode: extra.mode || "text",
    size: "720P",
    seconds: extra.seconds || "5",
    aspect_ratio: extra.aspect_ratio || "16:9",
    n: 1,
  };
  if (params.image) {
    body.mode = "reference";
    body.images = Array.isArray(params.image) ? params.image : [params.image];
  }
  if (params.seed !== undefined) {
    body.seed = params.seed;
  }

  let response: Response;
  try {
    response = await fetch("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelId, body, apiKey }),
    });
  } catch (error) {
    throw new VideoGenerationError(
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
    throw new VideoGenerationError(errorMessage, response.status, `HTTP_${response.status}`);
  }

  let data: VideoTaskResponse;
  try {
    data = await response.json();
  } catch {
    throw new VideoGenerationError("解析响应数据失败", undefined, "PARSE_ERROR");
  }

  return data;
}

export async function pollVideoResult(
  modelId: ModelId,
  videoId: string,
  apiKey: string,
): Promise<VideoTaskResponse> {
  const params = new URLSearchParams({ model: modelId, video_id: videoId, apiKey });
  params.set("model_name", modelId);

  let response: Response;
  try {
    response = await fetch(`/api/generations?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw new VideoGenerationError(
      `网络请求失败: ${error instanceof Error ? error.message : "未知错误"}`,
      undefined, "NETWORK_ERROR",
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let errorMessage = `查询失败 (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new VideoGenerationError(errorMessage, response.status, `HTTP_${response.status}`);
  }

  let data: VideoTaskResponse;
  try {
    data = await response.json();
  } catch {
    throw new VideoGenerationError("解析响应数据失败", undefined, "PARSE_ERROR");
  }

  return data;
}

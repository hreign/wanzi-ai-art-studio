export type ModelId = "sensenova-u1-fast" | "agnes-image-2.1-flash" | "agnes-video-v2.0";
export type ProviderId = "sensenova" | "agnes";

export interface ModelConfig {
  id: ModelId;
  name: string;
  description: string;
  category: "image" | "video";
  capabilities: ("text-to-image" | "image-to-image" | "text-to-video" | "image-to-video" | "keyframe-animation")[];
  sizes: string[];
  maxN: number;
  defaults: Record<string, unknown>;
  responseFormats: ("url" | "b64_json")[];
}

export type ResponseFormat = "url" | "b64_json";

export interface GenerationParams {
  model: ModelId;
  prompt: string;
  size?: string;
  n?: number;
  response_format?: ResponseFormat;
  image?: string | string[];
  return_base64?: boolean;
  extra_body?: Record<string, unknown>;
  width?: number;
  height?: number;
  num_frames?: number;
  frame_rate?: number;
  seed?: number;
  negative_prompt?: string;
}

export interface GeneratedImage {
  url?: string;
  b64_json?: string;
}

export interface GenerationResult {
  id: string;
  prompt: string;
  params: GenerationParams;
  images?: GeneratedImage[];
  videoUrl?: string;
  createdAt: number;
  modelId: ModelId;
  status?: string;
}

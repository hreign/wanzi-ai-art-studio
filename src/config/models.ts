import type { ModelConfig, ModelId, ProviderId } from "@/types";

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  "sensenova-u1-fast": {
    id: "sensenova-u1-fast",
    name: "SenseNova U1 Fast",
    description: "商汤日日新原生多模态大模型 — 快速推理版本，支持文生图、信息图渲染",
    category: "image",
    capabilities: ["text-to-image"],
    sizes: ["1664x2496", "2496x1664", "1760x2368", "2368x1760", "1824x2272", "2272x1824", "2048x2048", "2752x1536", "1536x2752", "3072x1376", "1344x3136", "2560x720", "3072x864"],
    maxN: 4,
    defaults: {
      model: "sensenova-u1-fast",
      prompt: "",
      size: "2048x2048",
      n: 1,
    },
    responseFormats: ["url", "b64_json"],
  },
  "agnes-image-2.1-flash": {
    id: "agnes-image-2.1-flash",
    name: "Agnes Image 2.1 Flash",
    description: "Sapiens AI 图像生成模型，支持文生图和图生图，高信息密度图像优化",
    category: "image",
    capabilities: ["text-to-image", "image-to-image"],
    sizes: ["1024x768", "1024x1024", "768x1024", "1536x1024", "1024x1536"],
    maxN: 1,
    defaults: {
      model: "agnes-image-2.1-flash",
      prompt: "",
      size: "1024x768",
      n: 1,
    },
    responseFormats: ["url", "b64_json"],
  },
  "agnes-video-v2.0": {
    id: "agnes-video-v2.0",
    name: "Agnes Video V2.0",
    description: "面向生产场景的视频生成模型，支持文生视频、图生视频、多图视频及关键帧动画",
    category: "video",
    capabilities: ["text-to-video", "image-to-video", "keyframe-animation"],
    sizes: ["1280x768", "1152x768", "768x1152", "1024x1024"],
    maxN: 1,
    defaults: {
      model: "agnes-video-v2.0",
      prompt: "",
      size: "1152x768",
      width: 1152,
      height: 768,
      num_frames: 121,
      frame_rate: 24,
    },
    responseFormats: ["url"],
  },
};

export const MODEL_ENDPOINTS: Record<string, string> = {
  "sensenova-u1-fast": "https://token.sensenova.cn/v1/images/generations",
  "agnes-image-2.1-flash": "https://apihub.agnes-ai.com/v1/images/generations",
  "agnes-video-v2.0": "https://apihub.agnes-ai.com/v1/videos",
};

export const VIDEO_POLL_ENDPOINT = "https://apihub.agnes-ai.com/agnesapi";

export function getModelConfig(id: string): ModelConfig | undefined {
  return MODEL_REGISTRY[id];
}

export function getAvailableModelIds(): ModelId[] {
  return Object.keys(MODEL_REGISTRY) as ModelId[];
}

export function getProviderId(modelId: ModelId): ProviderId {
  if (modelId === "sensenova-u1-fast") return "sensenova";
  return "agnes";
}

export function getAvailableProviders(): ProviderId[] {
  return ["sensenova", "agnes"];
}

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  sensenova: "SenseNova",
  agnes: "Agnes",
};

export function getProviderModels(provider: ProviderId): ModelId[] {
  return (Object.values(MODEL_REGISTRY) as ModelConfig[])
    .filter((m) => getProviderId(m.id as ModelId) === provider)
    .map((m) => m.id as ModelId);
}

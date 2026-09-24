import type { ModelConfig, ModelId, ProviderId } from "@/types";

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  "agnes-image-2.5-flash": {
    id: "agnes-image-2.5-flash",
    name: "Agnes Image 2.5 Flash",
    description: "Agnes AI 最新一代图像模型，支持文生图、图生图和多图合成，高信息密度图像优化",
    category: "image",
    capabilities: ["text-to-image", "image-to-image"],
    sizes: ["1024x768", "1024x1024", "768x1024", "1536x1024", "1024x1536", "1K", "2K", "3K", "4K"],
    maxN: 1,
    defaults: {
      model: "agnes-image-2.5-flash",
      prompt: "",
      size: "2K",
      n: 1,
    },
    responseFormats: ["url", "b64_json"],
  },
  "sensenova-u1.5-lite": {
    id: "sensenova-u1.5-lite",
    name: "SenseNova U1.5 Lite",
    description: "日日新最新一代图片创作模型，基于 Neo-unify 架构，生成与编辑一体，支持参考图功能",
    category: "image",
    capabilities: ["text-to-image", "image-to-image"],
    sizes: ["auto", "2048x2048", "2720x1536", "1536x2720", "1664x2496", "2496x1664", "4096x4096", "1024x1024"],
    maxN: 1,
    defaults: {
      model: "sensenova-u1.5-lite",
      prompt: "",
      size: "2048x2048",
      n: 1,
    },
    responseFormats: ["url", "b64_json"],
  },
  "sensenova-u1.5-fast": {
    id: "sensenova-u1.5-fast",
    name: "SenseNova U1.5 Fast",
    description: "日日新图片创作模型加速版，基于 Neo-unify 架构，即时创作，高效修改",
    category: "image",
    capabilities: ["text-to-image", "image-to-image"],
    sizes: ["auto", "2048x2048", "2720x1536", "1536x2720", "1664x2496", "2496x1664", "4096x4096", "1024x1024"],
    maxN: 1,
    defaults: {
      model: "sensenova-u1.5-fast",
      prompt: "",
      size: "2048x2048",
      n: 1,
    },
    responseFormats: ["url", "b64_json"],
  },
  "agnes-video-2.5-flash": {
    id: "agnes-video-2.5-flash",
    name: "Agnes Video 2.5 Flash",
    description: "Agnes Video 2.5 Flash 视频生成模型，支持文生视频、首尾帧控制和图片/音频参考生成",
    category: "video",
    capabilities: ["text-to-video", "image-to-video", "keyframe-animation"],
    sizes: ["720P"],
    maxN: 1,
    defaults: {
      model: "agnes-video-2.5-flash",
      prompt: "",
      size: "720P",
      n: 1,
    },
    responseFormats: ["url"],
  },
};

export const MODEL_ENDPOINTS: Record<string, string> = {
  "sensenova-u1.5-lite": "https://token.sensenova.cn/v1/images/generations",
  "sensenova-u1.5-fast": "https://token.sensenova.cn/v1/images/generations",
  "agnes-image-2.5-flash": "https://apihub.agnes-ai.com/v1/images/generations",
  "agnes-video-2.5-flash": "https://apihub.agnes-ai.com/v1/videos",
};

export const VIDEO_POLL_ENDPOINT = "https://apihub.agnes-ai.com/agnesapi";

export const IMAGE_EDIT_ENDPOINTS: Record<string, string> = {
  "sensenova-u1.5-lite": "https://token.sensenova.cn/v1/images/edits",
  "sensenova-u1.5-fast": "https://token.sensenova.cn/v1/images/edits",
};

export function getModelConfig(id: string): ModelConfig | undefined {
  return MODEL_REGISTRY[id];
}

export function getAvailableModelIds(): ModelId[] {
  return Object.keys(MODEL_REGISTRY) as ModelId[];
}

export function getProviderId(modelId: ModelId): ProviderId {
  if (modelId === "sensenova-u1.5-lite" || modelId === "sensenova-u1.5-fast") return "sensenova";
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

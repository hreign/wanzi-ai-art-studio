import { NextRequest, NextResponse } from "next/server";
import { MODEL_ENDPOINTS, VIDEO_POLL_ENDPOINT } from "@/config/models";

export const runtime = "nodejs";

const MAX_BODY_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  let bodyData: { model?: string; body?: unknown; apiKey?: string };
  try {
    bodyData = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式无效" }, { status: 400 });
  }

  const { model, body: originalBody, apiKey } = bodyData;

  if (!model) {
    return NextResponse.json({ error: "缺少模型名称参数: model" }, { status: 400 });
  }

  const endpoint = MODEL_ENDPOINTS[model];
  if (!endpoint) {
    return NextResponse.json({ error: `不支持的模型: ${model}` }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  let body: string | undefined;

  if (originalBody) {
    try {
      body = JSON.stringify(originalBody);
      if (body.length > MAX_BODY_SIZE) {
        return NextResponse.json({ error: "请求体过大" }, { status: 413 });
      }
      
    } catch {
      return NextResponse.json({ error: "请求体验证失败" }, { status: 400 });
    }
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
    });
  } catch (error) {
    console.error("[Generations] POST failed:", error instanceof Error ? error.message : error, "model:", model);
    return NextResponse.json(
      { error: "请求失败", detail: error instanceof Error ? error.message : "未知错误" },
      { status: 502 },
    );
  }

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!["connection", "transfer-encoding", "content-encoding", "content-length"].includes(lower)) {
      responseHeaders[key] = value;
    }
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {

  const { searchParams } = new URL(request.url);
  const model = searchParams.get("model");
  const videoId = searchParams.get("video_id");
  const apiKey = searchParams.get("apiKey");

  if (!model || !videoId) {
    return NextResponse.json({ error: "缺少参数: model, video_id" }, { status: 400 });
  }

  if (!MODEL_ENDPOINTS[model]) {
    return NextResponse.json({ error: `不支持的模型: ${model}` }, { status: 400 });
  }

  const pollUrl = new URL(VIDEO_POLL_ENDPOINT);
  pollUrl.searchParams.set("video_id", videoId);

  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  let response: Response;
  try {
    response = await fetch(pollUrl.toString(), {
      method: "GET",
      headers,
    });
  } catch (error) {
    console.error("[Generations] GET failed:", error instanceof Error ? error.message : error, "video_id:", videoId);
    return NextResponse.json(
      { error: "查询失败", detail: error instanceof Error ? error.message : "未知错误" },
      { status: 502 },
    );
  }

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!["connection", "transfer-encoding", "content-encoding", "content-length"].includes(lower)) {
      responseHeaders[key] = value;
    }
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
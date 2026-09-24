# Agnes Video 2.5 Flash

> Agnes-Video-2.5-Flash API 接入指南

## 概述

Agnes Video 2.5 Flash 复用 Agnes Video 2.5 的模型能力和异步任务接口。除本页列出的 Flash 专属限制外，其他请求参数、响应字段和查询方式均与 Agnes Video 2.5 一致。

开发者可以使用文本提示词、首尾帧图片、参考图片或参考音频生成高质量视频。该模型适用于故事讲述、营销视频、产品演示、社交媒体内容以及 AI 创意工作流。

<Info>
  Agnes-Video-2.5-Flash 采用基于异步任务的 API。您需要先创建一个视频生成任务，然后使用返回的 `video_id` 获取视频结果。
</Info>

## 支持能力

<CardGroup cols={2}>
  <Card title="文生视频" icon="clapperboard">
    通过文本提示词直接生成视频
  </Card>

  <Card title="首尾帧控制" icon="image">
    通过首帧、尾帧或首尾帧控制视频生成
  </Card>

  <Card title="图片参考" icon="layer-group">
    使用参考图片引导视频生成，最多 5 张
  </Card>

  <Card title="音频参考" icon="volume-high">
    使用参考音频引导视频生成，最多 3 段
  </Card>

  <Card title="场景运动控制" icon="camera">
    通过提示词控制主体动作、镜头运动和场景动态
  </Card>

  <Card title="视觉一致性" icon="eye">
    在帧间保持一致的主体、风格和场景
  </Card>

  <Card title="电影级输出" icon="film">
    生成高质量电影级视频
  </Card>

  <Card title="异步API" icon="clock">
    先提交任务，再获取生成结果
  </Card>
</CardGroup>

## 与 Agnes Video 2.5 的差异

| 校验项            | Flash 规则                | 校验失败响应                          |
| -------------- | ----------------------- | -------------------------------- |
| size           | 仅支持字符串 `"720P"`         | HTTP 400：`size must be 720P`     |
| reference 图片数量 | `images` 最多 5 张          | HTTP 400：`images length must not exceed 5` |
| reference 音频数量 | `audios` 最多 3 段          | HTTP 400：`audios length must not exceed 3` |
| reference 视频输入 | 不支持有效的 `videos` 内容      | HTTP 400：`videos is not supported` |

Flash 专属校验在任务创建、排队、计费和推理前执行。校验失败的请求不会创建视频任务，也不会产生费用。

除上述限制外，`agnes-video-2.5-flash` 沿用 `agnes-video-2.5` 的公共参数能力和校验逻辑。

## API 接口

### 创建视频任务

| 项目           | 说明                                                                             |
| ------------ | ------------------------------------------------------------------------------ |
| 接口地址         | [https://apihub.agnes-ai.com/v1/videos](https://apihub.agnes-ai.com/v1/videos) |
| 请求方法         | POST                                                                           |
| Content-Type | application/json                                                               |
| 认证方式         | Bearer Token                                                                   |
| 请求头          | Authorization: Bearer YOUR\_API\_KEY                                           |

### 获取视频结果：推荐方式

视频任务创建成功后，响应中会包含一个 `video_id`。

推荐使用 `video_id` 和 `model_name` 来获取视频结果。

| 项目   | 说明                                                                                |
| ---- | --------------------------------------------------------------------------------- |
| 接口地址 | `https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID>&model_name=agnes-video-2.5-flash` |
| 请求方法 | GET                                                                               |
| 认证方式 | Bearer Token                                                                      |
| 请求头  | Authorization: Bearer YOUR\_API\_KEY                                              |

## 请求参数

### 公共参数

| 参数                    | 类型             | 必填 | 说明                          |
| --------------------- | -------------- | -- | --------------------------- |
| model                 | string         | 是  | 模型名称。使用 agnes-video-2.5-flash |
| prompt                | string         | 是  | 视频内容的文本描述。Reference 模式可使用 `<Picture N>` 和 `<Audio N>` 指代素材 |
| mode                  | string         | 是  | 生成模式：`text`、`keyframe` 或 `reference` |
| seconds               | string         | 否  | 视频时长，支持字符串 `"4"`–`"12"`，默认 `"5"` |
| size                  | string         | 否  | Flash 固定为 `"720P"`；其他值返回 HTTP 400 |
| aspect\_ratio         | string         | 否  | 默认 `16:9`，支持值见"视频尺寸与画幅"      |
| seed                  | integer        | 否  | 随机种子，用于生成可复现的结果             |
| n                     | integer        | 否  | 当前仅支持 `1`，默认 `1`            |

### 模式专用参数

| 参数                    | 类型             | 适用模式       | 说明                          |
| --------------------- | -------------- | ---------- | --------------------------- |
| first\_frame          | string         | keyframe   | 首帧图片 URL；与 `last_frame` 至少提供一个 |
| last\_frame           | string         | keyframe   | 尾帧图片 URL；与 `first_frame` 至少提供一个 |
| images                | string\[]      | reference  | 参考图片 URL 列表，Flash 最多支持 5 张  |
| audios                | string\[]      | reference  | 参考音频 URL 列表，Flash 最多支持 3 段  |
| videos                | object\[]      | reference  | Flash 不支持；传入有效内容返回 HTTP 400  |

### 生成模式规则

| mode       | 用途            | 必需媒体                  | 不允许的媒体字段                          |
| ---------- | ------------- | --------------------- | --------------------------------- |
| text       | 纯文本生成视频      | 无                     | first\_frame、last\_frame、images、audios、videos |
| keyframe   | 首帧、尾帧或首尾帧控制  | first\_frame 与 last\_frame 至少一个 | images、audios、videos              |
| reference  | 图片或音频参考生成    | images 或 audios 至少一类非空 | first\_frame、last\_frame、videos    |

`reference` 模式下，`images` 与 `audios` 可以单独使用或同时使用；图片不超过 5 张，音频不超过 3 段。

所有媒体 URL 都应可由 Agnes AI 服务公开访问，并在任务完成前保持有效。

## 创建视频任务

<Tabs>
  <Tab title="示例 1：文生视频">
    使用此请求通过文本提示词直接生成视频。

    ```bash theme={null}
    curl -sS -X POST "https://apihub.agnes-ai.com/v1/videos" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "agnes-video-2.5-flash",
        "prompt": "夜晚森林中三只猫组成微型铜管乐队向前行进，镜头平稳后退，月光穿过树叶",
        "seconds": "5",
        "mode": "text",
        "size": "720P",
        "aspect_ratio": "16:9"
      }'
    ```
  </Tab>

  <Tab title="示例 2：首尾帧控制">
    使用此请求通过首帧、尾帧控制视频生成。

    ```bash theme={null}
    curl -sS -X POST "https://apihub.agnes-ai.com/v1/videos" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "agnes-video-2.5-flash",
        "prompt": "人物从首帧姿态自然转身走向窗边，镜头缓慢推进并平滑过渡到尾帧",
        "seconds": "5",
        "mode": "keyframe",
        "size": "720P",
        "first_frame": "https://example.com/first.png",
        "last_frame": "https://example.com/last.png"
      }'
    ```
  </Tab>

  <Tab title="示例 3：图片参考">
    使用参考图片引导视频生成。

    ```bash theme={null}
    curl -sS -X POST "https://apihub.agnes-ai.com/v1/videos" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "agnes-video-2.5-flash",
        "prompt": "以 <Picture 1> 中的角色和美术风格为参考，角色在花田中自然奔跑，保持外观一致",
        "seconds": "5",
        "mode": "reference",
        "size": "720P",
        "aspect_ratio": "16:9",
        "images": ["https://example.com/character.png"]
      }'
    ```
  </Tab>

  <Tab title="示例 4：音频参考">
    使用参考音频引导视频生成。

    ```bash theme={null}
    curl -sS -X POST "https://apihub.agnes-ai.com/v1/videos" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "agnes-video-2.5-flash",
        "prompt": "以 <Audio 1> 的节奏和环境氛围作为参考，生成电影感夜间驾驶画面",
        "seconds": "5",
        "mode": "reference",
        "size": "720P",
        "aspect_ratio": "16:9",
        "audios": ["https://example.com/reference-audio.mp3"]
      }'
    ```
  </Tab>
</Tabs>

## 创建任务响应

视频任务创建成功后，API 会返回任务信息。

响应中同时包含 `id`、`task_id` 和 `video_id`。

`video_id` 是获取视频结果的推荐 ID。

```json theme={null}
{
  "id": "task_YOUR_TASK_ID",
  "task_id": "task_YOUR_TASK_ID",
  "video_id": "video_YOUR_VIDEO_ID",
  "object": "video",
  "model": "agnes-video-2.5-flash",
  "status": "queued",
  "progress": 0,
  "created_at": 1790062812
}
```

### 响应字段

| 字段          | 类型      | 说明                 |
| ----------- | ------- | ------------------ |
| id          | string  | 任务 ID              |
| task\_id    | string  | 任务 ID。作用与 id 相同    |
| video\_id   | string  | 视频 ID。推荐用于获取视频结果   |
| object      | string  | 对象类型，通常为 video     |
| model       | string  | 当前任务使用的模型          |
| status      | string  | 当前任务状态             |
| progress    | integer | 当前任务进度百分比          |
| created\_at | integer | 任务创建时间戳            |

## 获取视频结果

### 推荐方式：通过 `video_id` + `model_name` 获取

创建视频任务后，使用返回的 `video_id` 和 `model_name` 来获取视频结果。适用于 `text`、`keyframe` 和 `reference` 全部模式。

```bash theme={null}
curl -sS "https://apihub.agnes-ai.com/agnesapi?video_id=VIDEO_ID&model_name=agnes-video-2.5-flash" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

建议每隔 `1–2` 秒查询一次，直至 `status` 变为 `completed` 或 `failed`。

### 仅 `video_id` 方式（仅 text 模式）

仅适用于创建任务时使用 `mode: "text"` 的任务。`keyframe` 和 `reference` 模式必须指定 `model_name=agnes-video-2.5-flash`。

```bash theme={null}
curl -sS "https://apihub.agnes-ai.com/agnesapi?video_id=VIDEO_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 获取结果响应

任务完成后，API 返回最终视频结果。

```json theme={null}
{
  "completed_at": 1790062857,
  "created_at": 1790062812,
  "error": null,
  "expires_at": null,
  "id": "task_YOUR_TASK_ID",
  "internal_progress": 0,
  "internal_status": "pending",
  "object": "video",
  "progress": 100,
  "quality": "standard",
  "remixed_from_video_id": null,
  "seconds": "4",
  "size": "720P",
  "started_at": 1790062812,
  "status": "completed",
  "url": "https://example.com/generated/video.mp4"
}
```

### 结果字段

| 字段                       | 类型            | 说明                                    |
| ------------------------ | ------------- | ------------------------------------- |
| id                       | string        | 任务 ID                                 |
| video\_id                | string        | 视频 ID                                 |
| model                    | string        | 当前任务使用的模型                             |
| object                   | string        | 对象类型                                  |
| status                   | string        | 任务状态                                  |
| progress                 | integer       | 任务进度百分比                               |
| seconds                  | string        | 视频时长（秒）                               |
| size                     | string        | 视频分辨率                                 |
| url                      | string        | 最终生成的视频 URL。仅在 status 为 completed 时可用 |
| remixed\_from\_video\_id | string        | 关联视频 ID                               |
| error                    | object / null | 任务失败时返回的错误信息                          |

> 当 `status` 为 `completed` 时，从响应的顶层 `url` 字段获取视频地址，用于播放或下载。`internal_status` 和 `internal_progress` 是内部字段；即使它们仍为 `pending` 和 `0`，也应以 `status` 和 `progress` 为准。

## 任务状态

| 状态           | 说明        |
| ------------ | --------- |
| queued       | 任务正在队列中等待 |
| in\_progress | 视频正在生成    |
| completed    | 视频生成成功    |
| failed       | 视频生成失败    |

## 视频尺寸与画幅

`size` 必须使用 `"720P"`。具体输出尺寸通过 `aspect_ratio` 选择：

| aspect\_ratio | 输出像素      |
| ------------- | --------- |
| 21:9          | 1680x720  |
| 16:9          | 1280x704  |
| 4:3           | 960x720   |
| 1:1           | 720x720   |
| 3:4           | 720x960   |
| 9:16          | 720x1280  |

> `16:9` 的输出尺寸以实际生成文件为准。2026 年 9 月实测 `agnes-video-2.5-flash` 的 `720P` 输出为 `1280x704`。

## Flash 专属错误

同一次请求存在多个 Flash 参数错误时，接口按照 `size`、`images`、`audios`、`videos` 的顺序返回首个检测到的错误。

| 错误场景        | 响应                                                    |
| ----------- | ----------------------------------------------------- |
| size 非 720P | `{ "detail": "size must be 720P" }`                   |
| 图片超过 5 张    | `{ "detail": "images length must not exceed 5" }`     |
| 音频超过 3 段    | `{ "detail": "audios length must not exceed 3" }`     |
| 传入参考视频     | `{ "detail": "videos is not supported" }`             |

以上响应的 HTTP 状态码均为 `400`。其他错误码、任务响应字段和失败任务格式与 Agnes Video 2.5 一致。

## 错误码

| 状态码 | 说明                |
| --- | ----------------- |
| 400 | 请求无效。请检查请求参数      |
| 401 | 未授权。请检查您的 API Key |
| 404 | 任务或视频未找到          |
| 500 | 服务器错误             |
| 503 | 服务繁忙。请稍后重试        |

## 计费规则

Agnes Video 2.5 Flash 采用与 Agnes Video 2.5 相同的计费公式，当前限时免费。

```text theme={null}
视频总金额 = 输出秒数 × 输出分辨率单价
         + 输入视频秒数 × 输出分辨率单价
         + max(0, 图片数 - 免费图片张数) × 图片超额单价
```

按刊例价计算时，免费图片张数为 5 张。Agnes Video 2.5 Flash 仅支持 720P，且最多接受 5 张参考图片和 3 段参考音频。

| 输出分辨率 | 原价          | 现价       |
| ----- | ----------- | -------- |
| 720P  | $0.025 / 秒  | $0 / 秒   |

当前限时免费期间，输出视频秒数、输入视频秒数和参考图片均按 `$0` 计费。免费政策如有调整，以 Agnes AI 平台最新公告为准。

## 推荐参数

| 场景       | 推荐设置                                                        |
| -------- | ----------------------------------------------------------- |
| 标准视频生成   | mode: text, size: 720P, aspect\_ratio: 16:9, seconds: 5    |
| 首尾帧控制    | mode: keyframe, 提供 first\_frame / last\_frame              |
| 图片参考生成   | mode: reference, images 最多 5 张                             |
| 音频参考生成   | mode: reference, audios 最多 3 段                             |
| 可复现结果    | 设置固定的 seed                                                  |
| 查询任务结果   | 使用 video\_id + model\_name=agnes-video-2.5-flash           |

## 注意事项

<Check>
  * 使用 `agnes-video-2.5-flash` 作为模型名称。
  * 视频生成是异步的。
  * 您需要先创建视频任务，然后获取视频结果。
  * 创建任务响应会同时返回 `task_id` 和 `video_id`。
  * 新接入的集成应使用 `video_id` 获取视频结果。
  * `size` 固定为字符串 `"720P"`。
  * `mode=reference` 时，`images` 不超过 5 张。
  * `mode=reference` 时，`audios` 不超过 3 段。
  * `mode=reference` 时不要传入有效的 `videos` 内容。
  * `seconds` 使用字符串 `"4"`–`"12"`，`n` 固定为 `1`。
  * 所有模式推荐使用 `video_id` 和 `model_name=agnes-video-2.5-flash` 查询；不带 `model_name` 的纯 `video_id` 查询仅适用于 `mode: "text"`。
  * `url` 仅在 `status` 为 `completed` 时可用。
  * 不要在前端代码、日志或公开仓库中暴露 API Key。
</Check>

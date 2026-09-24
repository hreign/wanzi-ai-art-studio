# Agnes Image 2.5 Flash

## 1.模型概述

**Agnes Image 2.5 Flash** 是 Agnes AI 最新一代图像模型，图像生成、编辑、构图、细节呈现和提示词遵循等整体能力全面超过 Agnes Image 2.1 Flash。其请求与响应参数、支持尺寸、价格和计费方法均与 Agnes Image 2.1 Flash 保持一致。

Agnes Image 2.5 Flash 可根据文本提示词生成图像，也可基于输入图像进行转换、重绘和风格化编辑。它完整兼容 Agnes Image 2.1 Flash 的接入方式，并在各类支持工作流中提供更强的生成质量。结果支持以图像 URL 或 Base64 数据形式返回。

## 2.核心能力

<CardGroup cols={2}>
  <Card title="文生图" icon="wand-magic-sparkles">
    根据自然语言提示词生成高质量图像
  </Card>

  <Card title="图生图" icon="images">
    根据提示词转换或优化现有图像
  </Card>

  <Card title="多图合成" icon="layer-group">
    使用多张参考图像组合生成新图像
  </Card>

  <Card title="高信息密度图像" icon="chart-network">
    优化细节丰富、布局复杂、视觉元素密集的图像生成效果
  </Card>

  <Card title="构图保留" icon="crop">
    编辑输入图像时保留原始构图和主体布局
  </Card>

  <Card title="灵活尺寸控制" icon="expand">
    使用 1K、2K、3K、4K 等尺寸档位，并配合支持的宽高比
  </Card>

  <Card title="URL / Base64 输出" icon="link">
    支持图像 URL 或 Base64 数据返回
  </Card>

  <Card title="URL 或 Data URI 输入" icon="arrow-right-arrow-left">
    图生图支持公共图像 URL 或 Data URI Base64 输入
  </Card>
</CardGroup>

## 4.API 信息

### Base URL

<span class="field-row">
  <code>
    [https://apihub.agnes-ai.com](https://apihub.agnes-ai.com)
  </code>
</span>

<span class="field-row" />

### Endpoint

```text theme={null}
POST https://apihub.agnes-ai.com/v1/images/generations
```

### 请求头

```bash theme={null}
-H "Authorization: Bearer YOUR_API_KEY"
-H "Content-Type: application/json"
```

## 5.模型名称

文生图、图生图和多图合成工作流均使用以下模型名称：

<span class="field-row"><code>agnes-image-2.5-flash</code></span>

## 6.重要说明

* 使用 `agnes-image-2.5-flash` 作为模型名称。
* 文生图生成时，`model`、`prompt` 和 `size` 为必填参数。
* 图生图生成时，请在 `extra_body.image` 中提供输入图像 URL 或 Data URI Base64。
* 多图合成时，在 `extra_body.image` 中传入多张参考图像。
* 请勿将 `response_format` 放在请求体的顶层。
* 如果需要 URL 输出，请将 `"response_format": "url"` 放在 `extra_body` 内部。
* 如果文生图需要 Base64 输出，可以使用顶层参数 `"return_base64": true`。
* 图生图 Base64 输出，请在 `extra_body` 内部使用 `"response_format": "b64_json"`。
* 图生图请求不需要传递 `tags: ["img2img"]`。
* 请勿在公开文档中暴露临时 API 密钥。所有公开示例请使用 `YOUR_API_KEY`。

## 7.请求参数

| 参数                           | 类型        | 是否必填      | 描述                                  |
| ---------------------------- | --------- | --------- | ----------------------------------- |
| model                        | string    | 是         | 模型名称，请使用 agnes-image-2.5-flash      |
| prompt                       | string    | 是         | 图像生成或图像编辑的文本指令                      |
| size                         | string    | 是         | 输出尺寸档位，推荐值为 1K、2K、3K、4K；也兼容 1024x768 这类历史精确尺寸写法 |
| ratio                        | string    | 否         | 与档位式 size 配合使用的宽高比，默认值为 1:1         |
| image                        | string\[] | 图生图/多图合成必填 | 输入图像数组，支持公共图像 URL 或 Data URI Base64 |
| return\_base64               | boolean   | 否         | 文生图输出需要以 Base64 返回时使用               |
| extra\_body                  | object    | 否         | 高级工作流的附加参数                          |
| extra\_body.response\_format | string    | 否         | 输出格式，常见值：url, b64\_json             |

## 8.尺寸与宽高比

为了获得可预期的输出尺寸，建议将 `size` 与 `ratio` 配合使用。

推荐 `size` 值：`1K`、`2K`、`3K`、`4K`

支持的 `ratio` 值：`1:1`、`3:4`、`4:3`、`16:9`、`9:16`、`2:3`、`3:2`、`21:9`

如果请求 `1920x1080` 或 `2560x1440` 这类不受原生支持的精确尺寸，服务可能会自动映射到最接近的标准档位和宽高比。如果需要生成这类常见 16:9 显示素材，建议请求 `size: "2K"` 和 `ratio: "16:9"`，再在下游裁剪或缩放到最终画布。

### 输出尺寸参考

| Ratio | 1K         | 2K         | 3K         | 4K         |
| ----- | ---------- | ---------- | ---------- | ---------- |
| 1:1   | 1024x1024  | 2048x2048  | 3072x3072  | 4096x4096  |
| 3:4   | 864x1152   | 1728x2304  | 2592x3456  | 3456x4608  |
| 4:3   | 1152x864   | 2304x1728  | 3456x2592  | 4608x3456  |
| 16:9  | 1312x736   | 2624x1472  | 3936x2208  | 5248x2944  |
| 9:16  | 736x1312   | 1472x2624  | 2208x3936  | 2944x5248  |
| 2:3   | 832x1248   | 1664x2496  | 2496x3744  | 3328x4992  |
| 3:2   | 1248x832   | 2496x1664  | 3744x2496  | 4992x3328  |
| 21:9  | 1568x672   | 3136x1344  | 4704x2016  | 6272x2688  |

## 9.调用示例

## 9.1 文生图请求（URL 输出）

使用此请求根据文本提示词生成图像，并以图像 URL 形式返回结果。

```bash theme={null}
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.5-flash",
    "prompt": "A luminous floating city above a misty canyon at sunrise, cinematic realism",
    "size": "1024x768",
    "extra_body": {
      "response_format": "url"
    }
  }'
```

生成的图像 URL 返回路径：

```text theme={null}
data[0].url
```

## 9.2 文生图请求（Base64 输出）

当您需要生成的图像以 Base64 数据形式返回时，请使用此请求。

```bash theme={null}
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.5-flash",
    "prompt": "A clean product photo of a glass cube on a white studio background, soft shadows, high detail",
    "size": "1024x768",
    "return_base64": true
  }'
```

生成的 Base64 图像返回路径：

```text theme={null}
data[0].b64_json
```

## 9.3 图生图请求（URL 输入 + URL 输出）

使用此请求转换现有图像，同时保留原始构图。

```bash theme={null}
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.5-flash",
    "prompt": "Transform the scene into a rain-soaked cyberpunk night with neon reflections while preserving the original composition",
    "size": "1024x768",
    "extra_body": {
      "image": [
        "https://example.com/input-image.png"
      ],
      "response_format": "url"
    }
  }'
```

生成的图像 URL 返回路径：

```text theme={null}
data[0].url
```

## 9.4 图生图请求（URL 输入 + Base64 输出）

当输入图像以公共 URL 形式提供，且生成结果需要以 Base64 数据形式返回时，请使用此请求。

```bash theme={null}
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.5-flash",
    "prompt": "Make the object orange while preserving the original composition",
    "size": "1024x768",
    "extra_body": {
      "image": [
        "https://example.com/input-image.png"
      ],
      "response_format": "b64_json"
    }
  }'
```

生成的 Base64 图像返回路径：

```text theme={null}
data[0].b64_json
```

## 9.5 多图合成请求

使用多张参考图像组合生成新图像。

```bash theme={null}
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.5-flash",
    "prompt": "Combine the two characters into an intense fantasy battle scene, dynamic lighting, detailed background, cinematic composition",
    "size": "1024x768",
    "extra_body": {
      "image": [
        "https://example.com/character-1.png",
        "https://example.com/character-2.png"
      ],
      "response_format": "url"
    }
  }'
```

## 9.6 图生图请求（Data URI Base64 输入）

图生图也支持 Data URI Base64 输入。

Data URI 格式：

```text theme={null}
data:image/png;base64,BASE64_HERE
```

请求示例：

```bash theme={null}
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.5-flash",
    "prompt": "Make the object matte black while preserving the original composition",
    "size": "1024x768",
    "extra_body": {
      "image": [
        "data:image/png;base64,BASE64_HERE"
      ],
      "response_format": "b64_json"
    }
  }'
```

## 10.响应格式

## URL 输出

当 `extra_body.response_format` 设置为 `url` 时，响应格式如下：

```json theme={null}
{
  "created": 1780000000,
  "data": [
    {
      "url": "https://storage.googleapis.com/agnes-aigc/xxx.png",
      "b64_json": null,
      "revised_prompt": null
    }
  ]
}
```

生成的图像 URL：

```text theme={null}
data[0].url
```

## Base64 输出

启用 Base64 输出时，响应格式如下：

```json theme={null}
{
  "created": 1780000000,
  "data": [
    {
      "url": null,
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA...",
      "revised_prompt": null
    }
  ]
}
```

生成的 Base64 图像：

```text theme={null}
data[0].b64_json
```

## 11.推荐提示词结构

为获得更好的图像生成效果，请使用清晰的提示词结构：

```text theme={null}
[主体] + [场景 / 环境] + [风格] + [光照] + [构图] + [质量要求]
```

## 示例

```text theme={null}
日出时分薄雾峡谷上方的发光浮空城市，电影级写实风格，广角构图，丰富的建筑细节，柔和的金色光线，高视觉密度
```

对于图生图任务，请清楚描述哪些内容需要改变，哪些内容需要保持不变。

```text theme={null}
将场景转换为霓虹倒影的雨浸赛博朋克夜晚，同时保留原始构图和主体布局。
```

对于多图合成任务，请说明每张参考图的角色，以及最终图像应如何组合这些参考信息。

```text theme={null}
[参考图角色] + [目标场景] + [图像之间的关系] + [风格 / 光照 / 构图]
```

## 常见错误与故障排除

## 1. 顶层放置 `response_format` 会导致错误

请勿将 `response_format` 放在顶层。

错误写法：

```json theme={null}
{
  "model": "agnes-image-2.5-flash",
  "prompt": "A futuristic city",
  "size": "1024x768",
  "response_format": "url"
}
```

正确写法：

```json theme={null}
{
  "model": "agnes-image-2.5-flash",
  "prompt": "A futuristic city",
  "size": "1024x768",
  "extra_body": {
    "response_format": "url"
  }
}
```

## 2. 图生图不需要 `tags`

请勿传递：

```json theme={null}
{
  "tags": ["img2img"]
}
```

图生图只需在 `extra_body.image` 中提供输入图像即可。

## 3. 输入图像 URL 无法访问

如果服务器无法访问输入图像 URL，请求可能会失败。

推荐解决方案：

* 使用公共 HTTPS 图像 URL。
* 确保图像 URL 不需要登录、cookie 或私有请求头。
* 如果图像无法公开访问，请使用 Data URI Base64 输入。

## 4. 请求超时

根据提示词复杂度、图像尺寸和服务器负载情况，图像生成可能需要数秒到几十秒不等。

推荐的客户端超时时间：

```text theme={null}
60s 到 360s
```

## 5. 图生图请求缺少 `image` 参数

图生图和多图合成生成时，`extra_body.image` 为必填项。

## 定价

agnes-image-2.1-flash 和 agnes-image-2.5-flash 的价格及计费方法相同。当前所有输出分辨率档位和输入参考图片均免费。

| 计费项            | 刊例价（原价）       | 现价（优惠价） |
| -------------- | -------------- | --------- |
| 1K 输出图片        | $0.010 / 张     | $0        |
| 2K 输出图片        | $0.018 / 张     | $0        |
| 3K 输出图片        | $0.021 / 张     | $0        |
| 4K 输出图片        | $0.024 / 张     | $0        |
| 第 4 张起的输入参考图片  | $0.003 / 张     | $0 / 张    |

## 注意事项

* 使用 `agnes-image-2.5-flash` 作为模型名称。
* 使用 `https://apihub.agnes-ai.com/v1/images/generations` 作为 API 端点。
* 文生图生成时，`model`、`prompt` 和 `size` 为必填参数。
* 为获得可预期的输出尺寸，建议使用 `1K` 或 `2K` 等 `size` 档位，并配合 `ratio`。
* 图生图和多图合成生成时，请在 `extra_body.image` 中提供输入图像 URL 或 Data URI Base64。
* 需要生成结果以图像 URL 返回时，使用 `extra_body.response_format: "url"`。
* 文生图 Base64 输出，请使用 `return_base64: true`。
* 图生图 Base64 输出，请使用 `extra_body.response_format: "b64_json"`。
* 请勿将 `response_format` 放在顶层。
* 请勿传递 `tags: ["img2img"]`。
* 请勿在公开文档中暴露临时 API 密钥。所有公开示例请使用 `YOUR_API_KEY`。
* 目前先支持通过 base64 传入图片给模型

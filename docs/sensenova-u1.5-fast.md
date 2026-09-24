# SenseNova **U1.5 Fast** 模型文档

## 基本信息

| 项目 | 内容 |
|------|------|
| **模型名称** | SenseNova **U1.5 Fast** |
| **Model ID** | `sensenova-u1.5-fast` |
| **模型描述** | 日日新最新一代图片创作模型加速版，基于 Neo-unify 架构，即时创作，高效修改。提升图片生成与编辑效率，兼顾生成质量与响应速度，缩短创作与修改等待时间；增强复杂图文创作能力，提升文字渲染、信息布局与多重指令遵循的效果；统一生成与编辑链路，支持参考图创作、局部修改、全局风格与布局调整。 |

## 请求地址

### 同步图片生成

**POST** `https://token.sensenova.cn/v1/images/generations`

> 说明：文生图接口，仅输入文本 prompt 来生成图片。

### 同步图片编辑

**POST** `https://token.sensenova.cn/v1/images/edits`

> 说明：图片编辑接口，输入参考图片 + 编辑提示词，完成图生图 / 图片改写。

## 图片生成请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| **model** | `string` | 是 | — | 必须填 `sensenova-u1.5-fast`。 |
| **prompt** | `string` | 是 | — | 图像生成描述。 |
| **size** | `string` | 否 | `auto` | 图像尺寸，2K / 4K 分辨率常量 `WIDTH` 和 `HEIGHT`，需要是 32 的倍数，最小值 512，最大值 4096，最大比例 3:1 或者 1:3。 |
| **n** | `integer` | 否 | `1` | 生成图片数量，仅支持值为 `1`。 |
| **watermark** | `boolean` | 否 | `true` | 是否添加日日新 SenseNova 官方 Logo 水印。`true`：添加水印；`false`：生成无水印纯图。 |
| **response_format** | `string` | 否 | `b64_json` | 可选 `b64_json`、公网 `url`（支持 http/https 协议）。`b64_json` 返回图片 Base64 内容；`url` 返回有效期为 24 小时的临时下载地址。 |
| **output_format** | `string` | 否 | `png` | 可选 `png`、`jpeg`、`webp`。控制图片文件格式。 |
| **prompt_extend** | `boolean` | 否 | `true` | 提示词自动润色优化开关，扩写失败时自动使用原始 prompt。 |

### 建议分辨率

| 尺寸 | 宽高比 | 档位 |
|------|--------|------|
| 2048 x 2048 | 1:1 | 2K |
| 2720 x 1536 | 16:9 | 2K |
| 1536 x 2720 | 9:16 | 2K |
| 1664 x 2496 | 2:3 | 2K |
| 2496 x 1664 | 3:2 | 2K |
| 4096 x 4096 | 1:1 | 4K |

## 图片生成示例（cURL）

```bash
curl https://token.sensenova.cn/v1/images/generations \
  -H "Authorization: Bearer $SENSENOVA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sensenova-u1.5-fast",
    "prompt": "一只白色毛绒绒的海豹宝宝漂浮在平静海面上，柔和晨光，写实摄影风格",
    "n": 1,
    "size": "1024x1024",
    "output_format": "png",
    "response_format": "url",
    "watermark": true
  }'
```

> `watermark=false`：公测期间免费开放去水印。

## 图片编辑请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| **model** | `string` | 是 | — | 必须填 `sensenova-u1.5-fast`。 |
| **images** | `array` | 是 | — | 图片对象数组，每项包含 `image_url`；第 1 张为主编辑图，至多支持 5 张参考图。 |
| **images[].image_url** | `string` | 是 | — | 可选 `b64_json`、公网 `url`（支持 http/https 协议）。 |
| **prompt** | `string` | 是 | — | 编辑指令，描述期望最终画面；去除首尾空格不可为空；尽量保留未指定修改的主体元素。 |
| **n** | `integer` | 否 | `1` | 生成图片数量，仅支持值为 `1`。 |
| **size** | `string` | 否 | `auto` | 图像尺寸，2K / 4K 分辨率常量；`auto` 自动适配主图。 |
| **response_format** | `string` | 否 | `b64_json` | 可选 `b64_json`、公网 `url`。`url` 返回 24 小时有效期临时链接。 |
| **output_format** | `string` | 否 | `png` | 可选 `png`、`jpg`、`jpeg`、`webp`。 |
| **watermark** | `boolean` | 否 | `true` | 是否添加日日新 SenseNova 官方 Logo 水印。 |
| **prompt_extend** | `boolean` | 否 | `true` | 提示词自动润色优化开关。 |

## 图片编辑示例（cURL）

### 使用公网 URL 图片输入

```bash
curl https://token.sensenova.cn/v1/images/edits \
  -H "Authorization: Bearer $SENSENOVA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sensenova-u1.5-fast",
    "images": [
      {
        "image_url": "https://www.sensenova.cn/images/little-seal.png"
      }
    ],
    "prompt": "背景换成在一望无际的冰川上",
    "watermark": true,
    "prompt_extend": true,
    "size": "auto",
    "response_format": "url"
  }'
```

### 使用 Base64 Data-URL 输入（python 示例）

```python
import os
import base64
import requests
image_path = "local_image.png"
with open(image_path, "rb") as f:
    base64_image = base64.b64encode(f.read()).decode("utf-8")
response = requests.post(
    "https://token.sensenova.cn/v1/images/edits",
    headers={
        "Authorization": f"Bearer {os.environ['SENSENOVA_API_KEY']}",
        "Content-Type": "application/json"
    },
    json={
        "model": "sensenova-u1.5-fast",
        "images": [
            {
                "image_url": f"data:image/png;base64,{base64_image}"
            }
        ],
        "prompt": "修改图片背景……",
        "watermark": True
    }
)
print(response.status_code)
print(response.json())
```

## 响应结构

```json
{
  "created": 1788849614,
  "data": [
    {
      "url": "https://cdn.sensenova.dev/gen/..."
    }
  ],
  "output_format": "png",
  "size": "1024x1024",
  "usage": {
    "input_tokens": 1540,
    "input_tokens_details": {
      "image_tokens": 0,
      "text_tokens": 1540
    },
    "output_tokens": 4096,
    "total_tokens": 5636,
    "images_count": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| **created** | `integer` | 响应产生的时间戳（秒）。 |
| **data** | `array` | 包含生成的图片信息。 |
| **data[n].url** | `string` | 生成图片的 CDN 链接，有效期 24 小时。 |
| **data[n].b64_json** | `string` | 生成图片的 Base64 内容。 |
| **output_format** | `string` | 图片文件格式。 |
| **size** | `string` | 生成图片的分辨率，格式为 `{宽度}x{高度}`。 |
| **usage** | `object` | Token 用量信息。 |

## 使用限制

* 使用独立的图像生成接口，**不是** Chat Completions 接口。
* 图片生成接口不支持图像输入。
* 图片编辑接口必须传入至少一张输入图片，不支持仅通过 `prompt` 发起请求。
* 接口返回的图片 URL 为**临时访问链接**，固定有效期 24 小时，超时后链接直接失效，无法再次访问图片。
* 无水印生成（`watermark=false`）当前免费公测，后续将转为付费功能。为避免未来默认值变更影响线上业务，建议调用时显式传入 `watermark` 参数。
* 图片输入支持：
  * **公网 URL**：提供可公开访问的图片地址，支持 HTTP 或 HTTPS 协议。
  * **Base64 编码**：支持通过 Data URL 方式传入图片 Base64 数据，格式为 `data:image/{format};base64,{base64_data}`。请求参数必须包含完整的 Data URL 前缀，不支持直接传入纯 Base64 字符串。
* 若图片链接无法访问、链接内容并非有效图片，或 Base64 数据解码失败，请求将被直接拒绝。

## 错误码（常见）

| 错误码 | 含义 |
|--------|------|
| `401` | 未授权或 `Authorization` Header 缺失/错误。 |
| `400` | 参数错误，如缺少 `prompt`、`model` 与平台不匹配等。 |
| `429` | 超过调用次数配额。 |
| `500` | 服务器内部错误，建议稍后重试。 |

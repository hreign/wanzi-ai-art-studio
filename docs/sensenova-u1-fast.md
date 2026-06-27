# SenseNova **U1 Fast** 模型文档

## 基本信息

| 项目 | 内容 |
|------|------|
| **模型名称** | SenseNova **U1 Fast** |
| **Model ID** | `sensenova-u1-fast` |
| **调用次数限制** | 每 5 小时 1500 次 |
| **模型描述** | 基于 SenseNova U1 的加速版本，专供 **信息图（Infographics）** 生成。<br> **U1 Fast 使用独立的图像生成接口，**不是 Chat Completions 接口，**不支持图像输入**。 |

## 请求地址

**POST** `https://token.sensenova.cn/v1/images/generations`

> 说明：该地址仅用于 **U1 Fast** 的图像生成（信息图）请求，区别于聊天模型的 `/v1/chat/completions`。

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| **model** | `string` | 是 | — | 必须填 `sensenova-u1-fast`（Model ID）。 |
| **prompt** | `string` | 是 | — | 描述要生成的信息图内容。 |
| **size** | `string` | 否 | `1024x1024`（示例） | 生成图片的宽高，如 `2752x1536`。 |
| **n** | `integer` | 否 | `1` | 要返回的图片数量。 |
| **quality**（可选） | `string` | 否 | `standard` | 质量选项，`standard` / `high`（若平台提供）。 |
| **style**（可选） | `string` | 否 | — | 预设风格或主题（视平台支持而定）。 |

> 除 `model` 必填外，`prompt` 实际调用时也必须提供，否则会返回错误。其他参数为可选，若不传递会使用平台默认值。

## 完整示例（cURL）

```bash
curl https://token.sensenova.cn/v1/images/generations \
  -H "Authorization: Bearer $SENSENOVA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "model": "sensenova-u1-fast",
        "prompt": "这张信息图以柔和的粉色、淡黄色和浅蓝色为主色调，采用了极具亲和力的可爱卡通风格（包含猫咪、拟人化表情等元素）。整体排版从左到右分为三个主要区块，分别介绍核心能力、工作流程和重要规则。图表的左上角是醒目的主标题“信息图生成专家”，其下方紧跟副标题：“帮助用户将复杂信息转化为清晰易懂的视觉呈现”。以下是图表中各区块的详细结构和全部文字内容：…",
        "size": "2752x1536",
        "n": 1
      }'
```

> 替换 `$SENSENOVA_API_KEY` 为你在「控制台 → API Keys」中创建的密钥。

## 响应结构

```json
{
  "created": 1713167890,
  "data": [
    {
      "url": "https://cdn.sensenova.dev/gen/xxxxxxxxxxxxxx"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| **created** | `integer` | 响应产生的时间戳（秒）。 |
| **data** | `array` | 包含生成的图片信息。 |
| **data[n].url** | `string` | 生成图片的 CDN 链接，可直接访问或下载。 |
|（若 `n > 1`）| `data` 中会返回对应数量的对象，每个对象同样包含 `url`。|

## 错误码（常见）

| 错误码 | 含义 |
|--------|------|
| `401` | 未授权或 `Authorization` Header 缺失/错误。 |
| `400` | 参数错误，如缺少 `prompt`、`model` 与平台不匹配等。 |
| `429` | 超过调用次数配额（每 5 小时 1500 次）。 |
| `500` | 服务器内部错误，建议稍后重试。 |

**错误响应示例（JSON）**

```json
{
  "error": {
    "code": 400,
    "message": "Missing required field: prompt"
  }
}
```
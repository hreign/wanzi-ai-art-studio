# Agent Rules

## 包管理器: pnpm

- 使用 **pnpm**，不使用 npm 或 yarn。
- 命令: `pnpm install`, `pnpm add <pkg>`, `pnpm run <script>`, `pnpm dlx <pkg>`。
- 锁文件: `pnpm-lock.yaml`，不要生成 `package-lock.json` 或 `yarn.lock`。

## HTTP 客户端: native fetch

- 使用平台原生 `fetch`（Node 18+），不要引入 `axios`、`got`、`node-fetch` 等 HTTP 库。
- 超时使用 `AbortController`，代理/重试写小工具而非引入库。

## 代码风格

- 简洁，优先展示 diff 或命令而非长解释。
- 不要写解释性注释，除非用户要求。
- 修改文件时遵循已有代码风格。
- 组件化，模块化，先查找已有组件，优先扩展组件(props / children / variant)，禁止复制组件代码，禁止创建功能重复组件。

## 项目结构

- Next.js 16 App Router 项目，TypeScript 严格模式。
- 路径别名 `@/*` 指向 `src/*`。
- 组件使用 `"use client"` 标记客户端组件。
- CSS 使用 Tailwind CSS 4 + CSS 变量设计令牌。

## 关键约定

- API Key 仅存储在客户端 localStorage，不发送到第三方。
- 图像生成通过 `/api/proxy` 代理转发，避免 CORS。
- 模型配置在 `src/config/models.ts` 的 `MODEL_REGISTRY` 中管理。
- 历史记录存储在 localStorage，最多保留 100 条。
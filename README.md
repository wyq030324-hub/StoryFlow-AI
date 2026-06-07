# StoryFlow AI

**基于大语言模型的 AI 小说转剧本创作平台**

StoryFlow AI 是一个面向编剧、短剧创作者和自媒体团队的 AI 创作平台。用户可以输入小说章节、故事梗概或剧情片段，系统将基于大语言模型生成可继续编辑和生产使用的剧本初稿。

平台围绕“小说到剧本”的核心链路设计，支持生成人物表、场景拆分、动作描写、对白设计和标准剧本格式，帮助创作者提升从长文本故事到影视短剧初稿的生产效率。

## 核心功能

### 小说转剧本

支持输入：

- 小说章节
- 剧情大纲
- 故事片段

支持输出：

- 人物表
- 场景划分
- 动作描写
- 对白设计
- 标准剧本格式

### AI 剧本生成

基于大语言模型生成完整剧本内容，支持：

- 短剧改编
- 网文改编
- 剧情重构
- 对白优化

当前主链路聚焦剧本正文生成，避免在生成剧本时同时触发额外分析，提升响应速度和 token 利用效率。

```mermaid
flowchart LR
  A["输入小说 / 故事片段"] --> B["生成剧本"]
  B --> C["展示完整剧本"]
```

### Prompt Engine

StoryFlow AI 内置剧本改编提示词系统，用于控制模型输出结构和剧本质量。

支持：

- 剧情压缩
- 节奏控制
- 人物保留
- 风格调整
- 专业剧本格式约束

### 可扩展分析模块

除主剧本生成链路外，系统保留按需生成的扩展能力：

- 人物情感宇宙
- 平台适配分析
- 导演审查建议
- 改写建议

这些能力默认不阻塞剧本生成，用户可在需要时单独触发。

## 技术架构

### 前端

- React
- Vite
- Tailwind CSS
- react-router-dom
- lucide-react

### 后端

- Node.js
- Express
- 本地 Node API Proxy

### AI 能力

- 兼容 OpenAI API 规范的大语言模型调用能力
- 当前支持 DeepSeek
- 后续可扩展 GPT、Claude、Gemini 等模型
- Prompt Engineering

### 工程化

- Git
- GitHub
- `.env.local` 本地密钥管理
- `.env.example` 配置模板

## 项目结构

```text
StoryFlow-AI/
├─ server/
│  ├─ index.js                 # 本地 Node API Proxy
│  └─ utils/
│     └─ jsonGuard.js           # 大模型 JSON 返回兜底解析
├─ src/
│  ├─ agents/                  # 本地演示模式 Agent
│  ├─ components/              # 通用组件与布局
│  ├─ context/
│  │  └─ StoryContext.jsx       # 全局状态管理
│  ├─ data/                    # 示例小说与本地演示数据
│  ├─ pages/                   # 页面模块
│  │  ├─ Home.jsx
│  │  ├─ Studio.jsx             # 工作台
│  │  ├─ Characters.jsx
│  │  ├─ Rewrite.jsx
│  │  ├─ Comparison.jsx
│  │  ├─ ReviewReport.jsx
│  │  └─ SchemaDoc.jsx
│  ├─ prompts/                 # Prompt Engine
│  ├─ routes/
│  │  └─ AppRoutes.jsx
│  ├─ services/
│  │  └─ aiClient.js            # 前端 AI 请求客户端
│  ├─ utils/                   # 剧本格式化、YAML 等工具
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ .env.example
├─ package.json
├─ vite.config.js
└─ README.md
```

## 快速启动

安装依赖：

```bash
npm install
```

启动前端：

```bash
npm run dev
```

启动本地 API Proxy：

```bash
npm run server
```

同时启动前端和后端：

```bash
npm run dev:all
```

生产构建：

```bash
npm run build
```

## 环境变量配置

复制环境变量模板：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置：

```env
USE_MOCK=false
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

说明：

- `USE_MOCK=true`：启用本地演示模式，用于离线演示和稳定验证。
- `USE_MOCK=false`：启用真实模型模式，通过本地 Node API Proxy 调用大语言模型。
- API Key 只应存放在 `.env.local`，不要提交到 GitHub。
- 前端不会直接暴露模型 API Key。

## 运行模式

StoryFlow AI 支持两种运行方式：

- **本地演示模式**：使用本地数据完成稳定演示，适合无网络或不希望消耗模型额度的场景。
- **真实模型模式**：通过本地 Node API Proxy 调用兼容 OpenAI API 规范的大语言模型，输入不同小说会生成不同剧本结果。

当前真实模型链路：

```mermaid
flowchart TD
  A["小说 / 故事片段"] --> B["Script Only Prompt"]
  B --> C["Node API Proxy"]
  C --> D["大语言模型 API"]
  D --> E["剧本正文"]
  E --> F["完整剧本展示"]
```

## 页面结构

- **官方首页**：展示产品定位与核心能力。
- **工作台**：输入小说，生成专业剧本，按需触发增强分析。
- **人物感情线**：展示角色关系、叙事中心和情感线索。
- **创意重构**：选择风格方向，生成不同改编方案。
- **原著对照**：对照原文段落与生成 Scene。
- **导演审查报告**：展示 AI 导演审查维度、评分与修改建议。
- **YAML 结构文档**：说明结构化导出格式和后续扩展方向。

## 项目截图

> 截图区域预留。建议后续将截图放入 `docs/screenshots/`，并在此处补充展示。

```text
docs/screenshots/
├─ home.png
├─ workspace.png
├─ screenplay.png
├─ characters.png
├─ rewrite.png
└─ review.png
```

## Roadmap

### v1.0

- 小说转剧本
- 真实模型 API 接入
- 本地演示模式 / 真实模型模式
- 完整剧本展示

### v1.1

- 剧本格式优化
- 长文本分段生成
- 更稳定的错误恢复与重试机制

### v1.2

- 人物情感宇宙增强
- 导演审查建议增强
- 改写建议按风格深度生成

### v2.0

- 多角色协同创作
- 多模型评审
- 分镜生成
- 配音与短剧生产链路扩展

## 安全说明

- 不要提交 `.env.local`。
- 不要在前端代码中写入真实 API Key。
- 公开仓库只提交 `.env.example`。
- 生产环境建议使用后端服务或 Serverless Proxy 管理模型密钥。

## 项目定位

StoryFlow AI 致力于将长文本小说内容转化为符合影视创作规范的结构化剧本。通过大语言模型、Prompt Engineering 与剧本工作流设计，帮助创作者快速完成从故事构思到剧本初稿的内容生产过程。未来将持续扩展人物关系分析、导演审查、平台适配、多角色协同创作等能力，逐步构建完整的 AI 编剧工作台。

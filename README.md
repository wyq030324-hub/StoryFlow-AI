# StoryFlow AI

一句话介绍：StoryFlow AI 是一个面向网文作者、短剧团队和影视编剧的 AI 编剧工作台与 AI 创作伙伴，让小说以导演的语言重生。

## 项目背景 / 用户痛点

网文、短剧和影视改编之间存在明显断层。小说强调叙述节奏、心理描写和文字气质，剧本则强调场景、动作、台词、冲突和可拍性。创作者常常遇到这些问题：

- 网文作者难以判断某一章节是否适合改编成短剧或影视片段。
- 编剧团队需要快速把原著段落拆成场景、动作线和台词。
- 短剧团队需要结构化产物，而不是散乱的 AI 文本。
- 导演和制片需要评估忠实度、人物一致性、情感还原度和逻辑完整度。
- 比赛路演需要一个稳定、可解释、能完整跑通的产品闭环。

StoryFlow AI 的目标不是替代作者，而是把“小说文本”转换成可对照、可审查、可重构、可导出的剧本生产接口。

## 核心功能

- 小说输入：支持手动输入，也支持一键加载原创示例小说。
- 多 Agent 工作流：按顺序完成原著分析、改编规划、剧本生成、导演审查和 YAML 导出。
- 原著对照：左侧展示小说段落，右侧展示对应场景剧本，支持点击高亮。
- 导演审查报告：展示四项评分、问题清单、修正建议、主题和情感走向。
- YAML结构文档：解释导出字段、设计理念、示例输出和扩展方向。
- 人物宇宙：用星图展示人物关系、情绪强度、成长轨迹和关键 Scene。
- 创意重构引擎：通过导演提示词和风格胶囊生成新的改编方向建议。
- 官方首页：呈现 StoryFlow AI 的品牌定位、Agent 工作流和产品能力预览。

## 多 Agent 工作流

```mermaid
flowchart LR
  A["小说输入"] --> B["原著分析师"]
  B --> C["改编策划师"]
  C --> D["剧本编剧"]
  D --> E["导演审查官"]
  E --> F["YAML导出"]
```

## 页面结构

- 官方首页：产品展示入口，讲清 StoryFlow AI 的品牌定位和核心能力。
- 工作台：主交付页，负责加载示例小说、启动分析、展示 Agent 状态、输出和复制 YAML。
- 人物宇宙：帮助导演和编剧理解人物关系、人物成长和情感脉络。
- 创意重构引擎：用于快速探索不同风格下的改编方向。
- 原著对照：用于检查原文段落与生成场景的对应关系。
- 导演审查报告：用于展示 AI 评估结论、评分、问题和建议。
- YAML结构文档：用于解释结构化交付格式和后续生产链路。

## Prompt Engine

`src/prompts/` 是 StoryFlow AI 的提示词资产层，用来统一管理多 Agent 工作流中的提示词结构、输出约束和阶段职责。当前版本已经拆分出以下核心 Prompt：

- `originalAnalyzerPrompt`：负责原著分析，提取主题、人物、场景、情绪和导演保留要点。
- `adaptationPlannerPrompt`：负责改编规划，生成 Scene 级改编计划和风险点。
- `screenplayWriterPrompt`：负责剧本生成，约束模型输出专业影视剧本 JSON。
- `directorReviewerPrompt`：负责导演审查，评估忠实度、人物一致性、情感还原度和逻辑完整度。
- `characterGraphPrompt`：负责人物关系图谱，输出 Narrative Graph Engine 所需结构。
- `rewritePrompt`：负责创意重构，引导不同风格的改编方向生成。
- `directorRoomPrompt`：负责导演会议室分析，从导演、制片和平台视角给出建议。

Prompt Engine 的目标不是把所有逻辑塞进一个超长提示词，而是把“分析、规划、生成、审查、图谱、重构”拆成稳定可维护的阶段，以便后续替换为真实大模型调用。

## 技术栈

- React 18
- Vite 5
- TailwindCSS 3
- lucide-react
- react-router-dom
- useContext + useReducer

项目当前为纯前端实现，不包含后端、数据库或真实 API 调用。

## 本地运行方式

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

## Demo Mode 说明

当前版本是前端 Demo Mode 产品原型。用户点击“加载示例小说”后，系统会载入原创小说《潮汐归档人》，再通过本地 Mock Agent 依次模拟：

1. 原著分析师
2. 改编策划师
3. 剧本编剧
4. 导演审查官
5. YAML导出官

Mock Agent 用于稳定验证完整工作流，确保比赛现场可以可靠展示“输入小说、分析、生成剧本、审查、导出 YAML”的完整闭环。

## 当前版本说明：前端 MVP + Mock Agent

StoryFlow AI 当前版本定位为“前端 MVP + Mock Agent”的比赛展示原型：

- 已完成完整前端产品体验。
- 已完成 Demo Mode 核心闭环。
- 已完成官方首页、工作台、人物宇宙、创意重构、原著对照、导演审查报告和 YAML 结构文档。
- 已完成 YAML 结构化输出。
- Agent 层已预留替换空间，后续可从本地 mock 平滑切换为真实大模型调用。

## 为什么暂不直连真实 API

当前版本未在前端暴露真实 API Key。原因是 Vite 前端环境变量会被打包到浏览器端代码中，只适合存放公开配置，不适合存放大模型密钥。

如果直接在前端调用真实模型接口，会带来这些风险：

- API Key 暴露在浏览器代码或网络请求中。
- 公开 GitHub 后密钥可能被扫描和滥用。
- 比赛现场网络不稳定会影响演示成功率。
- 真实模型输出存在不确定性，可能破坏固定路演节奏。

因此，当前版本使用 Mock Agent 保证产品叙事和功能闭环稳定，不把真实 Key 写入前端代码。

## 未来接入真实模型方案：Serverless API Proxy

后续推荐通过 Serverless API Proxy 接入真实大模型：

- 前端只调用自己的 Serverless 接口。
- API Key 存放在 Serverless 平台的环境变量中。
- Serverless 负责转发请求、做错误处理、限流和日志。
- Demo Mode 继续保留为 fallback，保证演示稳定性。
- originalAnalyzer、adaptationPlanner、screenplayWriter、directorReviewer 可逐步替换为真实 prompt 调用。

这个方案兼顾安全性、部署成本和比赛后继续迭代的可行性。

## 项目目录结构

```text
src/
├─ agents/
│  ├─ adaptationPlanner.js
│  ├─ directorReviewer.js
│  ├─ originalAnalyzer.js
│  └─ screenplayWriter.js
├─ components/
│  ├─ layout/
│  │  ├─ AppShell.jsx
│  │  └─ TopBar.jsx
│  ├─ SceneCard.jsx
│  └─ ScoreCard.jsx
├─ context/
│  └─ StoryContext.jsx
├─ data/
│  ├─ demoNovel.js
│  └─ mockAgentResults.js
├─ pages/
│  ├─ Comparison.jsx
│  ├─ Characters.jsx
│  ├─ Home.jsx
│  ├─ ReviewReport.jsx
│  ├─ Rewrite.jsx
│  ├─ SchemaDoc.jsx
│  └─ Studio.jsx
├─ routes/
│  └─ AppRoutes.jsx
├─ utils/
│  └─ yamlFormatter.js
├─ App.jsx
├─ index.css
└─ main.jsx
```

## 截图占位说明

建议提交比赛或 GitHub 前补充以下截图：

- 工作台首屏截图
- Agent 分析中状态截图
- YAML 输出截图
- 人物宇宙截图
- 创意重构引擎截图
- 原著对照页截图
- 导演审查报告截图

截图可以放在 `docs/screenshots/` 中，并在 README 顶部补充图片预览。

## 比赛演示路径

1. 打开官方首页，说明 StoryFlow AI 是 AI 编剧工作台和 AI 创作伙伴。
2. 进入“工作台”。
3. 点击“加载示例小说”。
4. 点击“开始剧本分析”。
5. 观察五个 Agent 依次完成。
6. 查看 YAML 输出并复制 YAML。
7. 前往“人物宇宙”查看人物关系和人物档案。
8. 前往“创意重构引擎”展示不同风格的改编方向。
9. 前往“原著对照”查看原文和场景的对应关系。
10. 前往“导演审查报告”查看评分、问题和建议。
11. 打开“YAML结构文档”，说明后续可接入分镜、配音、短剧生成和视频生成。

## 后续扩展方向

- 接入真实大模型 API，替换本地 Mock Agent。
- 支持多章节批量改编和版本对比。
- 生成导演分镜表、镜头提示词和拍摄备注。
- 接入 AI 配音，按角色拆分台词。
- 接入短剧生成和视频生成链路。
- 增加多模型评审，让不同模型从导演、编剧、制片角度交叉打分。
- 支持 YAML、JSON、Markdown、PDF 等多格式导出。

## DeepSeek Real AI Mode

当前版本同时支持两种运行模式：

- `Demo Mode`：始终可用，使用本地 Mock Agent 演示完整闭环。
- `Real AI Mode`：通过本地 Node Proxy 调用 DeepSeek，前端不会暴露 API Key。

配置方式：

1. 复制 `.env.example` 为 `.env.local`
2. 填写 `DEEPSEEK_API_KEY`
3. 如需真实调用，请设置 `USE_MOCK=false`
4. 运行 `npm install`
5. 运行 `npm run dev:all`
6. 打开工作台并切换到 `Real AI Mode`

说明：

- `Demo Mode` 会继续保留，便于比赛现场稳定演示。
- `Real AI Mode` 依赖本地 `server`，如果 `server` 未启动或 Key 无效，将返回结构化错误。
- 生产环境应改为后端代理或 Serverless Proxy，不应在前端暴露 API Key。

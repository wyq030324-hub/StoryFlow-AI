# StoryFlow AI 阶段记录

## 阶段 01｜架构审核

### 要求
- 完成项目架构审核
- 设计目录结构
- 检查技术风险
- 输出 MVP 路线图

### 实际产出
- 明确采用 React 18 + Vite 5 + TailwindCSS 3 + lucide-react
- 确认状态管理使用 `useContext + useReducer`
- 确认不接后端、不接数据库、不用 Redux / Zustand
- 确认核心流程：Novel Input → Original Analyzer → Adaptation Planner → Screenplay Writer → Director Reviewer → YAML Export

## 阶段 02｜项目骨架

### 要求
- 项目可安装、可运行
- 建立基础路由与 StoryContext
- 不做业务页面

### 实际产出
- 完成 `package.json`、`vite.config.js`、`tailwind.config.js`
- 完成 `src/main.jsx`、`src/App.jsx`、`src/index.css`
- 建立 `src/context/StoryContext.jsx`
- 建立四个基础路由页占位：
  - `Studio`
  - `Comparison`
  - `ReviewReport`
  - `SchemaDoc`

## 阶段 03｜Demo Mode 闭环

### 要求
- 打通 Demo Mode
- 让多 Agent 串行流程可运行
- 输出 YAML

### 实际产出
- 完成 `src/data/demoNovel.js`
- 完成 `src/data/mockAgentResults.js`
- 完成 4 个 mock agents：
  - `originalAnalyzer.js`
  - `adaptationPlanner.js`
  - `screenplayWriter.js`
  - `directorReviewer.js`
- 完成 `yamlFormatter.js`
- 完成 `Studio` 最小闭环：
  - 加载示例小说
  - 启动分析
  - Agent 状态变化
  - YAML 输出
  - Copy YAML

## 阶段 04｜四页信息架构

### 要求
- 完善 `Comparison`
- 完善 `ReviewReport`
- 完善 `SchemaDoc`
- 轻量增强 `Studio`

### 实际产出
- `Comparison` 支持原著段落与 Scene 点击高亮
- `ReviewReport` 展示四项评分、问题、建议、主题、情感走向
- `SchemaDoc` 展示 YAML Schema、字段解释、示例输出、扩展方向
- `Studio` 增加 workflowStep、场景数量、审查状态、YAML 长度和跨页入口

## 阶段 05｜比赛级 UI 升级

### 要求
- 全面中文化
- 建立暗金墨韵视觉系统
- 提升工作台展示感

### 实际产出
- 用户可见文案中文化
- 建立暗金主题变量与统一卡片层级
- 完成 `README` 初版升级
- 增强 `Studio` 的 Logo 区、状态区、统计卡与流程表现

## 阶段 06A｜体验打磨

### 要求
- 错误状态渲染
- AppShell 侧边导航
- Agent 动效补充
- YAML 区域体验优化
- 页面淡入过渡

### 实际产出
- 新增错误提示块
- 新增：
  - `src/components/layout/AppShell.jsx`
  - `src/components/layout/TopBar.jsx`
- `AppRoutes` 增加页面淡入切换
- `Studio` 增加 agent running 光柱和 YAML 回顶逻辑

## 阶段 06B｜真实 AI 接入方案设计

### 要求
- 评估纯前端接 API 风险
- 给出真实接入建议

### 实际产出
- 明确不在前端暴露 API Key
- 确认 `.env.local` 仅适合本地演示
- 推荐后续采用 Proxy / Serverless 方案
- 保留 Demo Mode 作为稳定 fallback

## 阶段 07｜Showcase 与稳定性修复

### 要求
- 新增独立展示页
- 修复已知小问题

### 实际产出
- 新增 `/showcase`
- 补充滚动叙事、3D 卡片、暗金动态展示
- 修复：
  - Studio 错误提示缺失
  - Showcase 评分未接真实 state
  - 移动端 orbit 卡片间距

## 阶段 08｜产品定位与提交包装

### 要求
- 面向比赛提交做专业化包装
- 完善 README、.gitignore、演示路径

### 实际产出
- README 升级为参赛项目文档
- 补充项目背景、运行方式、Demo Mode、未来方案
- `.gitignore` 完善敏感与产物忽略规则

## 阶段 09｜导航与产品定位升级

### 要求
- 升级产品定位
- 强化侧栏导航体验

### 实际产出
- 完成 Story Deck 卡牌式侧栏
- 移动端 TopBar 改为横向 Story Chips
- 路由结构扩展为多页面工作台体系

## 阶段 10｜视觉动效升级

### 要求
- 借鉴高质量创意网站
- 增强首页、工作台、人物宇宙、创意重构的动态表现

### 实际产出
- `index.css` 新增全站关键帧与动画 class
- 首页加入动态背景与能力展示
- 工作台增强 Metrics、YAML 面板、Agent 时间线
- 人物宇宙与创意重构交互升级

## 阶段 11｜移动端 QA 与滚动触发

### 要求
- 修复移动端布局
- 用 IntersectionObserver 做滚动触发入场

### 实际产出
- 新增：
  - `src/hooks/useRevealOnScroll.js`
  - `src/hooks/useRevealGroup.js`
- 修复首页、人物宇宙、TopBar、小屏布局
- 重点模块改为滚动触发 reveal

## 阶段 12｜核心体验重构

### 要求
- 首页极简化
- 侧栏更专业
- 工作台强调完整剧本
- 创意重构和人物宇宙更产品化

### 实际产出
- 首页改为极简官方首页
- 工作台新增完整剧本主展示区
- 创意重构支持更多导演向表达
- 人物关系页继续向“导演工具”方向收敛

## 阶段 13｜创意重构稳定性与剧本编辑

### 要求
- 修复风格选择消失
- 增加完整剧本可编辑能力

### 实际产出
- `Rewrite` 风格选择状态稳定保留
- `Studio` 剧本区支持编辑、保存、取消、复制

## 阶段 14｜叙事图谱引擎

### 要求
- 参考图谱产品思路
- 把人物宇宙升级为 Narrative Graph Engine

### 实际产出
- `Characters` 接入更结构化的人物图谱数据
- 增强节点、边、导演分析面板、图谱报告
- 支持聚焦、筛选、高亮关系

## 阶段 15A｜Prompt Engine

### 要求
- 建立完整 Prompt Engine
- 为真实 API 接入做准备

### 实际产出
- 新增 `src/prompts/`
- 完成：
  - `systemPrompt`
  - `workflowRules`
  - `originalAnalyzerPrompt`
  - `adaptationPlannerPrompt`
  - `screenplayWriterPrompt`
  - `directorReviewerPrompt`
  - `characterGraphPrompt`
  - `rewritePrompt`
  - `directorRoomPrompt`
  - `playground`
- 完成 Prompt README 文档

## 阶段 15B｜真实 AI 接入

### 要求
- 接入 DeepSeek
- 增加本地 Node Proxy
- 保留 Demo Mode
- 输出专业影视剧本格式

### 实际产出
- 新增 `server/index.js`
- 新增 `server/utils/jsonGuard.js`
- 新增 `src/services/aiClient.js`
- 新增 `.env.example`
- 接入两阶段真实工作流：
  - `phase1`：analysisResult + adaptationPlan + screenplayDraft
  - `phase2`：reviewResult + characterGraph + directorRoom
- `Studio` 支持 Demo Mode / Real AI Mode 切换
- `screenplayFormatter` 输出专业剧本格式
- 保留 Mock fallback，避免演示失稳

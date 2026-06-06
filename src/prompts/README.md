# StoryFlow Prompt Engine

`src/prompts` 是 StoryFlow AI 的提示词资产层。当前阶段不接真实 API、不写 API Key、不改变 UI、不改动 `StoryContext`，仅沉淀后续接入 DeepSeek、Claude、GPT、Qwen 时可复用的 Prompt 系统。

## Prompt Engine Advanced Architecture

```text
Original Analyzer
↓
Adaptation Planner
↓
Screenplay Writer
↓
Director Reviewer
↓
Character Universe Engine
↓
Creative Rewrite Engine
↓
Director Room Engine
```

## 1. 设计思想

StoryFlow AI 的目标不是让模型随意总结小说，而是把小说章节转化为可拍摄、可审查、可再创造、可进入后续分镜和短剧生产链路的专业剧本资产。

Prompt Engine 使用三个核心原则：

- **Scene-level Generation**：以 Scene 为最小生成单位，避免整章粗暴总结。
- **Character-first**：先确认人物关系、动机和语言风格，再写行为与对白。
- **Emotion-first**：先确认情感走向和高潮，再设计场景节奏。

## 2. 为什么采用多 Agent Prompt Pipeline

单个 Prompt 同时承担分析、规划、写作、审查、人物图谱和创意重构，容易出现以下问题：

- 遗漏人物或关键情节。
- 改编时过度发挥，破坏原著逻辑。
- 剧本输出不稳定，Scene 粒度不一致。
- 导演审查无法精确定位问题。
- 人物关系只能变成普通介绍，无法服务导演决策。

因此 StoryFlow AI 将任务拆成多个专业 Agent Prompt。

## 3. 各 Agent 职责

### Original Analyzer

只分析原著，不进行改编。它负责提取：

- 主题
- 人物
- 场景
- 情感走向
- 关键细节
- 心理描写
- 核心冲突
- 必须保留的内容

### Adaptation Planner

根据原著分析结果，生成改编约束和 Scene 级计划。它负责回答：

- 哪些情节必须保留
- 哪些人物行为不能改变
- 哪些心理描写需要外化
- 每个 Scene 的戏剧目的是什么
- 哪些地方存在改编风险

### Screenplay Writer

根据原文、分析结果和改编计划，逐场景生成专业剧本 JSON。它强调：

- 场景头专业
- 动作可拍摄
- 心理外化
- 台词符合身份
- 不粗暴总结整章

### Director Reviewer

从导演、编剧、制片视角审查剧本质量。它检查：

- 原著忠实度
- 人物一致性
- 情感还原度
- 逻辑完整度
- 是否残留主观心理叙述
- 是否遗漏关键情节

### Character Universe Engine

人物宇宙不是普通关系图，而是导演决策工具。它输出：

- 人物节点
- 人物原型
- 剧情推动力
- 情感推动力
- 冲突制造力
- 改编优先级
- 人物关系强度
- 冲突张力
- 叙事图谱报告

### Creative Rewrite Engine

创意重构不属于忠实改编链路，因此使用独立 Prompt。它分三层输出：

1. 原作分析
2. 风格变换策略
3. 重构剧本结果

它用于探索：

- 都市奇幻 → 克苏鲁恐怖
- 都市奇幻 → 情感治愈
- 都市奇幻 → 黑色电影
- 都市奇幻 → 悬疑短剧

### Director Room Engine

导演会议室用于模拟导演、制片人和平台审核三方讨论。它负责分析：

- 选角风险
- 情绪损失风险
- 场景压缩风险
- 预算风险
- 短剧平台适配度
- 导演执行建议

## 4. 为什么先分析再规划再写剧本

如果模型直接写剧本，往往会为了流畅度而压缩情节、合并场景、改变人物动机。

StoryFlow AI 的主链路是：

```text
小说输入
→ 原著分析
→ 改编规划
→ 剧本生成
→ 导演审查
→ 人物宇宙
→ 结构化输出
```

这样可以让模型在写作之前先明确：

- 哪些情节不能删
- 哪些人物行为不能改
- 哪些心理描写必须外化
- 哪些 Scene 必须独立呈现
- 情感高潮应该落在哪里

## 5. 为什么 Scene-level Generation 更稳定

Scene-level Generation 可以降低整章一次生成的不稳定性：

- 每个 Scene 都有明确地点、时间、人物和戏剧目的。
- 每个 Scene 都能被导演审查定位。
- 人物动作、台词和环境反应更容易保持一致。
- 后续 YAML、分镜、配音、短剧生成都更容易衔接。

## 6. 为什么人物图谱单独生成

人物宇宙需要回答的问题和剧本生成不同。

剧本生成关注“如何写成戏”；人物宇宙关注“谁在推动故事”。

因此 `characterGraphPrompt` 单独生成：

- 谁是叙事中心
- 谁推动剧情
- 谁推动情感
- 谁制造冲突
- 谁是改编重点
- 谁删除后故事会崩塌

## 7. 为什么 Rewrite 使用独立 Prompt

忠实改编要求保留原著主旨、人物、情感和关键事件。

Rewrite 是再创造，可以改变风格、情绪和叙事方向。它不应该被忠实性原则过度限制，因此使用独立 Prompt，避免污染主工作流。

## 8. Prompt Playground

`playground.js` 提供轻量调试入口：

- `previewAnalyzerPrompt()`
- `previewPlannerPrompt()`
- `previewWriterPrompt()`
- `previewRewritePrompt()`
- `previewCharacterGraphPrompt()`
- `previewDirectorRoomPrompt()`

这些函数会返回完整 Prompt 字符串，方便后续调试 DeepSeek 或其他模型。

## 9. 后续如何接 DeepSeek / Claude / GPT / Qwen

建议下一阶段新增 API 调用层：

- `src/api/llmClient.js`
- `src/api/providers/deepseekClient.js`
- `src/api/providers/openaiClient.js`
- `src/api/providers/anthropicClient.js`
- `src/api/providers/qwenClient.js`

最小接入方式：

1. Agent 函数继续保留现有函数名。
2. Agent 内部根据配置选择真实 API 或 Demo fallback。
3. 调用 Prompt Engine 生成 prompt。
4. 调用统一 `llmClient`。
5. 将模型返回内容解析为 JSON。
6. 如果真实 API 失败，回退到当前 Mock 数据。

安全建议：

- 不要把真实 API Key 写进前端代码。
- 本地演示可以使用 `.env.local`，但不要提交。
- 公开部署建议使用 Serverless API Proxy。
- 前端只调用自己的代理接口，不直接暴露模型供应商 Key。

## 10. Prompt Engine Advanced Layer

阶段15A++ 新增了一组高级结构字段，用于提升真实模型接入后的产品质量和可扩展性。

### symbolic_elements

来源：`originalAnalyzerPrompt`

用途：象征元素提取，用于导演保留清单。

模型需要识别象征物、特殊地点、反复出现的物件、特殊天气、特殊颜色和特殊动作，并通过 `category` 区分：

- `object`
- `place`
- `weather`
- `color`
- `action`

未来模块：导演保留清单、视觉意象面板、分镜参考。

### adaptation_risk_points

来源：`adaptationPlannerPrompt`

用途：改编风险预警，用于 Director Room。

它会识别黑化动机不足、情绪转折突兀、场景压缩、人设崩坏和节奏拖沓等风险，并通过 `related_scene_id` 关联具体 Scene。

未来模块：一键定位修改、导演会议室风险面板、剧本优化队列。

### emotional_beat

来源：`screenplayWriterPrompt`

用途：情绪推进链，用于情绪曲线图和视频生成。

每个 Scene 都应有清晰的情绪推进，例如：

```text
压抑 → 怀疑 → 紧张 → 爆发
```

未来模块：情绪曲线图、导演审查、视频节奏规划。

### sound_design_hint

来源：`screenplayWriterPrompt`

用途：声音设计提示，用于短剧制作指导。

包含：

- `ambient`：环境音
- `key_sound`：关键音效
- `music_direction`：配乐方向

未来模块：声音设计表、AI 配音、视频生成提示词。

### rewrite_priority

来源：`directorReviewerPrompt`

用途：修改优先级，用于一键优化剧本。

它通过 `priority` 和 `estimated_effort` 判断哪些 Scene 应优先改、修改成本多高。

未来模块：一键优化剧本、审查问题排序、版本迭代计划。

### relationship_evolution

来源：`characterGraphPrompt`

用途：关系时间轴，用于 Character Universe 时间轴模式。

每条人物关系都包含：

- `stage_name`：关系阶段名称
- `trigger_event`：触发事件
- `emotional_shift`：情绪变化
- `current_stage`：当前阶段
- `potential_future`：导演可选关系走向

未来模块：人物关系时间轴、情感线强化建议、角色弧光追踪。

### style_intensity

来源：`rewritePrompt`

用途：改编强度控制，用于 Rewrite Engine 滑块。

范围 0-100。数值越高，风格变化和结构重构越强。

未来模块：创意重构强度滑块、类型片转换控制。

### preservation_ratio

来源：`rewritePrompt`

用途：原著保留比例，用于 Rewrite Engine 滑块。

范围 0-100。数值越高，原著情节、人物和情绪保留越多。

未来模块：忠实度控制、导演重构参数面板。

### platform_analysis

来源：`directorRoomPrompt`

用途：平台适配分析，用于 Director Room 平台评分。

结构化评估：

- 抖音短剧适配度
- 快手短剧适配度
- B站内容适配度
- 平台钩子潜力
- 平台风险
- 综合建议

未来模块：平台适配评分、短剧投放策略、路演商业化分析。

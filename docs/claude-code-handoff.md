# StoryFlow AI Claude Code 转接书

## 项目定位

StoryFlow AI 是一个 AI 小说转剧本创作平台，目标是把小说章节、剧情大纲或故事片段转换为可编辑、可导出、可继续打磨的专业影视剧本初稿。

当前项目已经具备：
- 小说输入与多 TXT 文件导入
- 示例小说库
- AI 创作模式与演示模式
- 专业剧本生成
- 原著内容与改编剧本对照编辑
- 人物感情线 / 叙事图谱
- 创意重构
- 导演审查
- YAML 导出与 YAML Schema 文档
- 本地 Node API Proxy 调用兼容 OpenAI API 规范的大模型，当前主要对接 DeepSeek

## 运行方式

```bash
npm install
npm run dev
npm run server
npm run dev:all
npm run build
```

环境变量请参考 `.env.example`。真实密钥只放在 `.env.local`，不要提交。

## 核心链路

主工作台路径：`/workspace`

用户流程：
1. 输入小说、上传 TXT，或从示例小说库加载文本
2. 系统识别章节
3. 点击生成剧本
4. 前端调用 `src/services/aiClient.js`
5. AI Client 请求本地 `server/index.js`
6. server 根据环境变量选择真实模型或演示模式
7. 返回剧本文本或结构化结果
8. 前端用 `src/utils/screenplayFormatter.js` 渲染为专业剧本
9. 用户可复制、导出 TXT / Markdown / YAML

## 关键目录

```text
src/pages              页面模块
src/components         通用组件与布局
src/context            全局 StoryContext
src/services           前端 AI Client
src/agents             演示模式 Agent 入口
src/prompts            Prompt Engine
src/utils              剧本格式化、YAML、章节解析等工具
src/data               示例小说、人物图谱与演示数据
server                 本地 Node API Proxy
docs                   项目文档与 YAML Schema
```

## 阶段21已完成修复

### 剧本格式

相关文件：
- `src/prompts/screenplayWriterPrompt.js`
- `src/utils/screenplayFormatter.js`

已升级为 Hollywood spec screenplay 风格：
- 场景标题：`INT. 地点 - 时间` / `EXT. 地点 - 时间`
- 人物名独立成行
- parenthetical 独立成行，例如：`（压低声音）`
- 台词使用中文双引号和完整中文标点
- 自动修复 `角色名：台词` 为专业对白格式
- 自动修复中文场次标题为 spec heading
- 动作描写不加引号

### 原著对照

相关文件：
- `src/pages/Comparison.jsx`

已调整为：
- 左侧：原著内容
- 右侧：改编剧本
- 一长段原著对应一长段剧本
- 右侧支持编辑、保存修改、复制、导出 TXT、导出 Markdown、导出 YAML
- 没有真实生成结果时展示示例对照，不使用 Mock 文案

### 人物感情线

相关文件：
- `src/pages/Characters.jsx`

已隐藏可见关系标签中的内部数值，例如 `S95`、`T70`。
内部 strength / tension 数据仍保留，用于线条粗细和亮度。

### 导演审查

相关文件：
- `src/pages/ReviewReport.jsx`

已增加评分 fallback：
- 戏剧冲突：82
- 镜头可拍性：86
- 人物一致性：78
- 节奏完成度：80
- 商业潜力：76

缺失或为 0 的评分不会再直接展示 0。

### 工作台数据预览

相关文件：
- `src/pages/Studio.jsx`

已保留真实参与系统的数据：
- 已识别章节数
- 预计场次数
- 剧本文字数
- 可导出格式：TXT / Markdown / YAML

删除了装饰性指标。

### YAML 结构页

相关文件：
- `src/pages/SchemaDoc.jsx`

已增加：
- 可编辑 YAML 文本框
- 复制 YAML
- 导出 YAML
- 重置示例
- 保留字段解释、设计原因、扩展字段说明

## 当前重点问题

1. `screenplayFormatter.js` 已做格式兜底，但真实模型仍可能输出不够长的剧本。后续可以继续加强 prompt 中“每章至少 2-3 场”和“长度 60%-120%”的执行约束。
2. 目前没有真正流式输出，长文本生成时用户等待感仍会存在。
3. YAML 导出是结构化包装，不是完整语义级剧本解析。后续可增加专门的 YAML structuring agent。
4. 导演审查 fallback 是合理兜底，不代表真实审查一定完成。后续建议把导演审查改为按需真实调用并缓存结果。
5. 原著对照当前按段落/场次聚合，不是语义级精准对齐。后续可做 chapter/scene alignment。

## Claude Code 建议优先级

P0：
- 检查真实 DeepSeek 输出是否稳定符合 spec screenplay。
- 用三篇示例小说分别跑一遍生成，观察是否有摘要化、冒号对白、长度不足。

P1：
- 优化 `createScriptOnlyScreenplayPrompt()`，进一步约束多章节长文本的场次数和篇幅。
- 增加一个轻量的前端生成结果质量检查，比如检测 `INT.` / `EXT.` 数量、冒号对白数量、无引号对白数量。

P2：
- 改进 YAML 导出，把剧本文本拆为 chapters / scenes / dialogues。
- 导演审查改为独立可重试的真实 AI 调用。

## 安全注意

- 不要提交 `.env.local`
- 不要把 DeepSeek API Key 写入前端代码
- 不要提交 `node_modules/`、`dist/`、旧 zip 包
- 公开仓库只提交 `.env.example`

## 最新验证

已执行：

```bash
npm run build
```

结果：通过。

浏览器快速检查：
- `/comparison` 有编辑、保存修改、复制、导出 TXT、导出 Markdown、导出 YAML
- `/comparison` 不出现“生成改写建议”
- `/schema` 有可编辑 YAML、复制、导出、重置
- `/characters` 不再显示 `S95` / `T70` 一类内部编号


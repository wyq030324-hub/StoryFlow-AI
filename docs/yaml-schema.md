# StoryFlow AI YAML Schema

## Schema 设计目标

StoryFlow AI 的 YAML Schema 用于把小说内容转换为可编辑、可审查、可继续生产的结构化剧本初稿。它需要同时服务作者、编剧、导演和后续自动化生产模块。

选择 YAML 的原因：

- 可读性强，创作者可以直接阅读和修改。
- 适合长篇剧本文档，比 JSON 更接近人类编辑习惯。
- 层级清晰，便于保留“章节 - 场次 - 动作 - 对白”的改编结构。
- 便于后续转换为分镜、拍摄计划、导演审查、平台适配和多平台短剧生产数据。

## 顶层字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 作品标题或改编剧本标题。 |
| `source_type` | string | 原始内容类型，当前固定为 `novel`。 |
| `chapter_count` | number | 识别或自动拆分出的章节数量。 |
| `characters` | array | 人物表，记录主要角色的基础信息。 |
| `chapters` | array | 章节数组，保留原著章节结构并承载对应场次。 |
| `scenes` | array | 每章内的剧本场次，是后续编辑、拍摄和审查的核心单元。 |

## characters 字段说明

`characters` 用于保存剧本人物表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 稳定人物 ID，便于后续跨章节追踪。 |
| `name` | string | 人物名称。 |
| `role` | string | 人物身份或叙事功能，例如主角、反派、导师、见证者。 |
| `description` | string | 人物简述，帮助编剧理解角色状态和创作方向。 |

## chapters 字段说明

`chapters` 保留原著章节结构，原因包括：

- 对应原著章节，方便作者检查改编是否遗漏。
- 支持 3 个章节以上的长文本分段处理。
- 便于作者逐章打磨剧本初稿。
- 方便后续按章节生成导演审查、人物变化和分镜计划。

每个章节建议包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `chapter_id` | string | 章节 ID，例如 `chapter_001`。 |
| `title` | string | 原著章节标题或自动拆分标题。 |
| `summary` | string | 本章剧情摘要。 |
| `scenes` | array | 本章对应的剧本场次。 |

## scenes 字段说明

`scenes` 是剧本生产的核心结构。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scene_id` | string | 场次 ID，例如 `scene_001`。 |
| `scene_title` | string | 场次标题，例如 `第1场 档案馆 / 夜晚 / 内景`。 |
| `location` | string | 场景地点。 |
| `time` | string | 场景时间。 |
| `interior_exterior` | string | 内景或外景。 |
| `characters` | array | 本场出现人物。 |
| `action` | string | 动作与画面描写。 |
| `dialogues` | array | 对白列表。 |
| `purpose` | string | 本场戏剧目的，例如建立悬疑、推动关系、制造反转。 |

## dialogues 字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `character` | string | 说话人物。 |
| `emotion` | string | 台词情绪或表演提示。 |
| `line` | string | 台词内容。 |

## 示例 YAML

```yaml
title: "潮汐归档人"
source_type: "novel"
chapter_count: 1
characters:
  - id: "char_001"
    name: "林默"
    role: "主角"
    description: "年轻档案员，谨慎敏感，正在追查被潮汐抹去的记忆。"
chapters:
  - chapter_id: "chapter_001"
    title: "第一章 档案馆夜谈"
    summary: "林默在档案馆发现异常线索。"
    scenes:
      - scene_id: "scene_001"
        scene_title: "第1场 档案馆 / 夜晚 / 内景"
        location: "档案馆"
        time: "夜晚"
        interior_exterior: "内景"
        characters:
          - "林默"
        action: "林默推开档案馆的木门，昏黄灯光从门缝里漏出。"
        dialogues:
          - character: "林默"
            emotion: "低声"
            line: "这里果然还有人来过。"
        purpose: "建立悬疑氛围，引出核心线索。"
```

## 设计原因总结

这套 Schema 面向小说改编和影视短剧生产，重点不是保存单段文本，而是把故事拆解为可编辑的生产结构。

- 对小说改编：保留章节和场次对应关系，方便追踪原著到剧本的转化。
- 对剧本编辑：动作、对白、人物和场次目的分离，便于逐场修改。
- 对导演审查：每场都有明确目的和人物信息，便于评估节奏、冲突和可拍性。
- 对分镜生成：场景地点、时间、内外景和动作描写可直接转为镜头规划输入。
- 对多平台短剧生产：结构化数据可以继续扩展为平台适配、角色配音、拍摄清单和版本管理。

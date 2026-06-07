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

## 扩展字段说明

以下字段属于高级扩展层，用于导演审查、情绪分析、声音设计、平台适配和视频生成等后续环节。基础字段已经可以支撑作者编辑剧本初稿，扩展字段则面向更专业的生产流程。

### scenes 扩展字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `emotional_beat` | array | 场次情绪推进链，例如压抑、怀疑、紧张、爆发。可用于情绪曲线、导演审查和视频节奏设计。 |
| `sound_design_hint` | object | 声音设计提示，包含 `ambient`、`key_sound`、`music_direction`。用于短剧配乐、音效和氛围设计。 |
| `purpose` | string | 本场戏剧目的，说明该场承担的叙事功能，例如建立悬疑、推动关系、制造反转。 |
| `transition` | string | 转场方式，例如 CUT TO、FADE OUT、声音转场或动作转场。 |

`sound_design_hint` 建议结构：

```yaml
sound_design_hint:
  ambient: "潮湿档案馆里的风声与远处海浪声"
  key_sound: "档案柜滑轨发出的刺耳摩擦声"
  music_direction: "低频弦乐，保持压抑和悬疑"
```

### 顶层扩展字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `theme` | string | 作品核心主题，用于统一剧本改编、导演审查和后续分镜方向。 |
| `emotional_arc` | array/string | 全篇情感走向，可用于情绪曲线展示和节奏审查。 |
| `adaptation_notes` | string/array | 改编总体说明，记录保留内容、压缩策略、风格方向和创作注意事项。 |

### review 扩展字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `overall_score` | number | 导演综合评分，范围 0-100。 |
| `dimensions` | object | 多维度评分，包含 `pacing`、`character_consistency`、`commercial_potential`、`dialogue_quality`。 |
| `platform_analysis` | object | 平台适配分析，用于判断短剧平台、视频平台或内容社区的适配度。 |
| `rewrite_priority` | array | 优先修改场次列表，帮助作者按影响程度和修改成本安排打磨顺序。 |

`review.dimensions` 建议结构：

```yaml
review:
  overall_score: 86
  dimensions:
    pacing: 84
    character_consistency: 88
    commercial_potential: 82
    dialogue_quality: 87
  platform_analysis:
    recommendation: "适合悬疑短剧方向，建议强化前三分钟钩子。"
  rewrite_priority:
    - scene_id: "scene_002"
      priority: "high"
      reason: "情绪转折略快，需要补充人物动机。"
```

### 设计原则

- 基础字段保证最低可用性，方便作者直接编辑。
- 扩展字段服务专业生产，方便后续导演审查、分镜生成、平台适配和视频生成。
- 基础字段与扩展字段分离，保证普通作者和高级工作流都能使用。

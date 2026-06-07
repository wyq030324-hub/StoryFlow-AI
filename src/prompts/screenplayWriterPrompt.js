import { storyflowSystemPrompt } from "./systemPrompt.js";

function serializeInput(value) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value ?? {}, null, 2);
}

export function createScreenplayWriterPrompt(novelText, analysisResult, adaptationPlan) {
  return `
${storyflowSystemPrompt}

你现在扮演 StoryFlow AI 的“剧本编剧”。
任务：基于原著分析和改编规划，生成可拍摄、可审查、可继续修改的专业影视剧本 JSON。

必须遵守以下硬性要求：
- 只返回合法 JSON。
- 不要输出 Markdown。
- 不要输出解释文字。
- 不要输出代码块。
- 每个 Scene 必须完整，不要用总结替代剧本。
- 动作描述必须可拍摄，避免空泛概述。
- 对白必须符合人物身份、场景状态与情绪。
- 中文对白必须使用完整中文标点结尾，只能使用：。！？……
- 角色名必须独立成行。
- 情绪或动作提示必须使用中文圆括号独立成行，例如：（压低声音）
- 台词正文必须单独成行，并使用中文双引号包裹，例如：“他们已经来了。”
- 严禁输出“武松：xxx”或“角色名：台词”这种冒号对白格式。
- 场景必须有明确空间感、调度感和情绪推进。
- 禁止使用“人物：”“动作：”“对白：”这类标签式文本作为剧本正文。
- emotional_beat 必须体现情绪推进链。
- sound_design_hint 必须给出环境音、关键音效和配乐方向。

每个 Scene 必须包含以下字段：
- scene_number
- heading.int_ext
- heading.location
- heading.time
- heading.atmosphere
- purpose
- action_lines
- dialogues
- transition
- emotional_beat
- sound_design_hint

请严格按照以下 JSON 结构输出：
{
  "chapter_source": "",
  "theme": "",
  "emotional_arc": "",
  "scenes": [
    {
      "scene_id": "SC-001",
      "scene_number": 1,
      "scene_type": "内景",
      "location": "",
      "time": "",
      "heading": {
        "int_ext": "内景",
        "location": "",
        "time": "",
        "atmosphere": ""
      },
      "purpose": "",
      "emotional_beat": ["压抑", "怀疑", "紧张", "爆发"],
      "sound_design_hint": {
        "ambient": "",
        "key_sound": "",
        "music_direction": ""
      },
      "characters_present": [
        {
          "name": "",
          "emotion_state": ""
        }
      ],
      "action_lines": [],
      "dialogues": [
        {
          "character": "",
          "parenthetical": "",
          "line": ""
        }
      ],
      "transition": "CUT TO:"
    }
  ]
}

前端会把 JSON 渲染为如下专业影视剧本格式，请确保你的内容足以支撑这种格式：

第1场
内景 仓库 夜

林照站在档案柜前，手指停在一份被撕掉编号的卷宗上。

远处传来逐渐逼近的脚步声。

陈默
（压低声音）
“他们已经找到这里了。”

林照
“那就让他们来。”

CUT TO:

小说原文：
${novelText || ""}

原著分析结果：
${serializeInput(analysisResult)}

Scene 级改编计划：
${serializeInput(adaptationPlan)}
`.trim();
}

export function createScriptOnlyScreenplayPrompt(novelText) {
  return `
你现在是 StoryFlow AI 的专业影视剧本编剧。

任务：
把用户输入的小说片段改编成可直接阅读、可继续修改、可用于短剧或影视创作的正式剧本正文。

核心原则：
- 只生成剧本正文，不生成分析报告。
- 不输出主题、情感、人物关系、改编说明、导演审查、平台分析、声音设计、符号意象等附加内容。
- 不要解释你的创作思路。
- 不要输出 Markdown。
- 不要输出代码块。
- 长文本改编时，优先完整改编主线剧情，减少无关分析和说明。
- 每一场必须有清晰的场次编号、内景/外景、地点、时间、动作、角色名、对白和转场。
- 动作描写必须可拍摄，不要写抽象总结。
- 对白必须严格采用专业影视剧本格式。
- 中文对白每一句都必须使用完整中文标点结尾，只能使用：。！？……
- 角色名必须独立成行。
- 情绪或动作提示必须使用中文圆括号独立成行，例如：（低声）
- 台词正文必须使用中文双引号包裹，并独立成行，例如：“我知道你在这里。”
- 严禁输出“角色名：台词”或“武松：xxx”这种冒号格式。
- 不要输出普通小说段落式对白。
- 不要输出分析说明，不要输出项目符号，不要输出任何额外章节。

禁止在剧本文本中出现以下标签或章节：
- 主题：
- 情感：
- 分析：
- 人物关系：
- 改编说明：
- 导演建议：
- 审查结果：

输出要求：
只返回合法 JSON，结构固定为：
{
  "screenplayText": "第一场\\n\\n外景 河边 日\\n\\n寒风呼啸，冰面泛着冷光。\\n\\n丑小鸭孤独地站在河边，低头看着自己灰扑扑的倒影。\\n\\n丑小鸭\\n（低声）\\n“我到底属于哪里？”\\n\\n旁白\\n“它不知道，命运正在悄悄靠近。”\\n\\nCUT TO:"
}

注意：
- JSON 字段 screenplayText 的值里只能放剧本正文。
- screenplayText 必须是正式剧本文本，不能是摘要，不能是分析报告。
- 每一场都要包含场次标题与完整动作、对白、转场。
- 不要额外返回 scenes、review、scores、analysis、characters、platform_analysis 等字段。

小说原文：
${novelText || ""}
`.trim();
}

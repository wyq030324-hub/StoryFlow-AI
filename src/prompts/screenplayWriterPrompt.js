import { storyflowSystemPrompt } from "./systemPrompt.js";

function serializeInput(value) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value ?? {}, null, 2);
}

const specScreenplayRules = `
剧本格式必须采用好莱坞 spec screenplay 风格：
- 场景标题使用英文格式：INT. 地点 - 时间 或 EXT. 地点 - 时间。
- 时间建议使用 DAY / NIGHT / DUSK / DAWN。
- 每个场景包含 Scene Heading、Action、Character Cue、Parenthetical、Dialogue、Transition。
- 人物名必须独立成行，例如：武松、店主、白骨精。
- 情绪或动作提示使用中文 parenthetical，独立成行，例如：（压低声音）。
- 台词必须使用中文双引号，并保留完整中文标点，例如：“若真有虎，今日便与它见个高下。”
- 台词结尾必须有中文标点：。！？……
- 动作描写不要加引号。
- 转场可使用 CUT TO:、FADE OUT.、MATCH CUT TO:。
- 禁止输出“武松：xxx”“武松:\"xxx\"”“武松 xxx”这类对白。
- 禁止输出没有标点的对白。
- 禁止输出普通小说段落式对白。
- 不要输出分析报告、YAML、Markdown 或代码块。
- 对 3 章小说，每章至少生成 2-3 场戏，三章小说至少 6-9 场。
- 剧本不能只是摘要，长度建议达到原文 60%-120%。
- 重点强调可拍摄性：场景调度、视觉动作、人物进入/离开/沉默/停顿、冲突推进和镜头感。
- 可以有镜头感，但不要写成分镜表。
`.trim();

const specScreenplayExample = `
EXT. 景阳冈山路 - NIGHT

月光照在乱石上。松林深处传来低沉的虎啸。武松停下脚步，慢慢握紧手中的哨棒。

武松
（压低声音）
“若真有虎，今日便与它见个高下。”

远处树影剧烈晃动。

CUT TO:

INT. 山下酒肆 - DUSK

店主站在门口，望着武松离去的背影，脸色发白。

店主
（急切）
“客官，冈上有虎，天色已晚，万万不可独行。”
`.trim();

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
- 场景必须有明确空间感、调度感和情绪推进。
- 禁止使用“人物：”“动作：”“对白：”这类标签式文本作为剧本正文。
- emotional_beat 必须体现情绪推进链。
- sound_design_hint 必须给出环境音、关键音效和配乐方向。

${specScreenplayRules}

每个 Scene 必须包含以下字段：
- scene_number
- scene_type
- location
- time
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
      "scene_type": "EXT.",
      "location": "景阳冈山路",
      "time": "NIGHT",
      "heading": {
        "int_ext": "EXT.",
        "location": "景阳冈山路",
        "time": "NIGHT",
        "atmosphere": "月光、松林、虎啸、危险逼近"
      },
      "purpose": "建立危险环境并推动人物进入核心冲突。",
      "emotional_beat": ["警觉", "压迫", "挑衅", "爆发"],
      "sound_design_hint": {
        "ambient": "夜风穿过松林",
        "key_sound": "远处虎啸",
        "music_direction": "低频鼓点逐渐增强"
      },
      "characters_present": [
        {
          "name": "武松",
          "emotion_state": "警觉但不退缩"
        }
      ],
      "action_lines": [
        "月光照在乱石上。松林深处传来低沉的虎啸。武松停下脚步，慢慢握紧手中的哨棒。",
        "远处树影剧烈晃动。"
      ],
      "dialogues": [
        {
          "character": "武松",
          "parenthetical": "压低声音",
          "line": "若真有虎，今日便与它见个高下。"
        }
      ],
      "transition": "CUT TO:"
    }
  ]
}

前端会把 JSON 渲染为如下 spec screenplay 格式，请确保你的内容足以支撑这种格式：

${specScreenplayExample}

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
- 长文本改编时，优先完整改编主线剧情。
- 不要输出 YAML，YAML 由系统导出按钮生成。

${specScreenplayRules}

输出要求：
只返回合法 JSON，结构固定为：
{
  "screenplayText": "${specScreenplayExample.replace(/\n/g, "\\n").replace(/"/g, '\\"')}"
}

注意：
- JSON 字段 screenplayText 的值里只能放剧本正文。
- screenplayText 必须是正式剧本文本，不能是摘要，不能是分析报告。
- 每一场都要包含场景标题、动作、角色名、对白和转场。
- 不要额外返回 scenes、review、scores、analysis、characters、platform_analysis 等字段。

小说原文：
${novelText || ""}
`.trim();
}

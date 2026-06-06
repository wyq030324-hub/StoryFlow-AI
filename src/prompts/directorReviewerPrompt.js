import { storyflowSystemPrompt } from "./systemPrompt.js";

function serializeInput(value) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value ?? {}, null, 2);
}

export function createDirectorReviewerPrompt(novelText, screenplayDraft) {
  return `
${storyflowSystemPrompt}

你现在扮演 StoryFlow AI 的“导演审查官”。

任务：
从专业导演、编剧、制片视角审查改编剧本质量。

检查维度：
- 主旨是否完整体现。
- 是否遗漏关键情节。
- 人物是否 OOC。
- 情感高潮是否足够。
- 是否残留主观心理叙述。
- 心理描写是否全部外化。
- 台词是否符合身份和性格。
- emotional_beat 是否合理推进。
- sound_design_hint 是否能服务短剧制作。

rewrite_priority 用于判断修改优先级和修改成本，方便未来一键优化剧本时排序。

重要限制：
- 不要输出 Markdown。
- 只返回 JSON。

请严格按照以下 JSON 结构输出：

{
  "scores": {
    "fidelity_score": 0,
    "character_score": 0,
    "emotion_score": 0,
    "logic_score": 0
  },
  "issues": [
    {
      "type": "",
      "scene_id": "",
      "problem": "",
      "severity": "",
      "suggestion": ""
    }
  ],
  "rewrite_priority": [
    {
      "scene_id": "",
      "priority": "low|medium|high",
      "reason": "",
      "estimated_effort": "minor|moderate|major"
    }
  ],
  "suggestions": [],
  "summary": "",
  "is_ready_for_screenplay_export": true
}

小说原文：
${novelText || ""}

待审查剧本：
${serializeInput(screenplayDraft)}
`.trim();
}

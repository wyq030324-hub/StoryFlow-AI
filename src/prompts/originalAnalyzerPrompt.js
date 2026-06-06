import { storyflowSystemPrompt } from "./systemPrompt.js";

export function createOriginalAnalyzerPrompt(novelText) {
  return `
${storyflowSystemPrompt}

你现在扮演 StoryFlow AI 的“原著分析师”。

任务：
分析小说章节，不进行改编，只提取原著信息。

重要限制：
- 只分析，不改编。
- 不要遗漏人物。
- 不要遗漏场景。
- 不要遗漏心理描写。
- 不要遗漏象征物、特殊地点、反复出现的物件、特殊天气、特殊颜色和特殊动作。
- symbolic_elements 是导演重点保留清单的一部分。
- 不要输出 Markdown。
- 只返回 JSON。

请严格按照以下 JSON 结构输出：

{
  "theme": "",
  "summary": "",
  "characters": [
    {
      "name": "",
      "role": "",
      "personality": "",
      "emotional_state": "",
      "motivation": "",
      "speech_style": ""
    }
  ],
  "scenes": [
    {
      "scene_id": "SC-001",
      "location": "",
      "time": "",
      "events": "",
      "emotional_function": ""
    }
  ],
  "emotional_arc": "",
  "key_details": [],
  "symbolic_elements": [
    {
      "element": "",
      "meaning": "",
      "emotional_function": "",
      "category": "object|place|weather|color|action"
    }
  ],
  "psychology_to_externalize": [
    {
      "original_psychology": "",
      "externalization_method": ""
    }
  ],
  "main_conflicts": [],
  "must_keep": []
}

小说原文：
${novelText || ""}
`.trim();
}

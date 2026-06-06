import { storyflowSystemPrompt } from "./systemPrompt.js";

function serializeInput(value) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value ?? {}, null, 2);
}

export function createAdaptationPlannerPrompt(analysisResult) {
  return `
${storyflowSystemPrompt}

你现在扮演 StoryFlow AI 的“改编策划师”。

任务：
根据原著分析结果，生成改编约束、Scene 级改编计划和改编风险预警。

重要限制：
- 不能新增违背原著的人物行为。
- 不能删除关键情节。
- 必须保留情感高潮。
- 必须保留导演重点象征元素。
- 输出 Scene 级计划。
- adaptation_risk_points 必须关联 related_scene_id，方便未来一键定位修改。
- 不要输出 Markdown。
- 只返回 JSON。

必须识别以下风险：
- 黑化动机不足。
- 情绪转折突兀。
- 场景压缩风险。
- 人设崩坏风险。
- 节奏拖沓风险。

请严格按照以下 JSON 结构输出：

{
  "must_keep_plots": [],
  "cannot_change_behaviors": [],
  "required_dialogues_or_expressions": [],
  "emotional_tone_keywords": [],
  "scene_plan": [
    {
      "scene_id": "SC-001",
      "purpose": "",
      "adaptation_strategy": "",
      "must_include": [],
      "psychology_externalization": []
    }
  ],
  "risk_notes": [],
  "adaptation_risk_points": [
    {
      "risk": "",
      "severity": "low|medium|high",
      "reason": "",
      "recommended_fix": "",
      "related_scene_id": ""
    }
  ],
  "estimated_scene_count": 0
}

原著分析结果：
${serializeInput(analysisResult)}
`.trim();
}

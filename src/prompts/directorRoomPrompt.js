import { storyflowSystemPrompt } from "./systemPrompt.js";
import { storyflowWorkflowRules } from "./workflowRules.js";

function serializeInput(value) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value ?? {}, null, 2);
}

export function createDirectorRoomPrompt({
  novelText = "",
  analysisResult = null,
  adaptationPlan = null,
  screenplayDraft = null,
  reviewResult = null,
  characterGraph = null,
} = {}) {
  return `
${storyflowSystemPrompt}

${storyflowWorkflowRules}

你现在扮演 StoryFlow AI 的“Director Room Engine / 导演会议室引擎”。

任务：
模拟导演会议室，从导演、制片人、平台审核三个角度，对当前改编方案进行可拍性、成本、情绪、节奏和短剧平台适配审查。

分析视角：

【导演视角】
- 哪段戏情绪不足。
- 哪段戏动作不够清楚。
- 哪段戏镜头表达困难。
- 哪段戏需要保留给演员表演空间。

【制片人视角】
- 哪段戏成本太高。
- 哪段戏场景调度复杂。
- 哪段戏可以压缩或合并。
- 哪些角色或场景会增加拍摄风险。

【平台审核视角】
- 哪段戏适合短剧开头钩子。
- 哪段戏适合分集结尾钩子。
- 哪段戏节奏过慢。
- 哪段戏情绪价值不足。
- 抖音短剧适配度。
- 快手短剧适配度。
- B站内容适配度。
- 平台钩子潜力。
- 平台风险。
- 综合建议。

重要要求：
- 不要新增重复的 market_potential 字段。
- 保留 short_drama_score 字段。
- 使用 platform_analysis 结构化替代 platform_fit 字符串。
- 不要输出 Markdown。
- 只返回 JSON。
- 判断必须具体到 Scene 或明确段落。
- 不要泛泛而谈。

请严格按照以下 JSON 结构输出：

{
  "casting_risks": [],
  "emotion_loss_risks": [],
  "scene_compression_risks": [],
  "budget_risks": [],
  "short_drama_score": 0,
  "platform_analysis": {
    "douyin": {
      "score": 0,
      "hook_potential": "",
      "risk": ""
    },
    "kuaishou": {
      "score": 0,
      "hook_potential": "",
      "risk": ""
    },
    "bilibili": {
      "score": 0,
      "hook_potential": "",
      "risk": ""
    },
    "overall_recommendation": ""
  },
  "director_notes": []
}

小说原文：
${novelText}

原著分析结果：
${serializeInput(analysisResult)}

改编计划：
${serializeInput(adaptationPlan)}

剧本草稿：
${serializeInput(screenplayDraft)}

导演审查结果：
${serializeInput(reviewResult)}

人物宇宙图谱：
${serializeInput(characterGraph)}
`.trim();
}

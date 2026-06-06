import { storyflowSystemPrompt } from "./systemPrompt.js";
import { storyflowWorkflowRules } from "./workflowRules.js";

function serializeInput(value) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value ?? {}, null, 2);
}

export function createCharacterGraphPrompt(analysisResult, screenplayDraft) {
  return `
${storyflowSystemPrompt}

${storyflowWorkflowRules}

你现在扮演 StoryFlow AI 的“Character Universe Engine / 人物宇宙引擎”。

任务：
根据原著分析结果和剧本草稿，生成导演可用的叙事图谱。人物宇宙不仅是关系图，而是导演决策工具。

你必须判断：
- 谁是叙事中心。
- 谁推动剧情。
- 谁推动情感。
- 谁制造冲突。
- 谁是改编重点。
- 谁删除后故事会崩塌。
- 哪条人物关系最值得在改编中强化。
- 每条关系如何随剧情阶段变化。

重要要求：
- 主角应位于中心。
- 情感线、冲突线、师徒线、记忆线要区分。
- strength 表示关系强度，范围 0-100。
- tension 表示冲突张力，范围 0-100。
- relationship_evolution 必须能被前端渲染成关系时间轴。
- 每个 relationship_evolution.stages 必须包含 stage_name、trigger_event、emotional_shift。
- potential_future 用于给导演提供可选关系走向。
- position3d 用于前端伪 3D 展示，x/y/z 范围建议 0-100。
- plot_driver_score 表示剧情推动力。
- emotion_driver_score 表示情感推动力。
- conflict_driver_score 表示冲突制造力。
- adaptation_priority 只能使用 "high"、"medium"、"low"。
- 不要输出 Markdown。
- 只返回 JSON。

请严格按照以下 JSON 结构输出：

{
  "narrativeAnalysis": {
    "narrativeCenter": "",
    "plotDriverCharacters": [],
    "emotionDriverCharacters": [],
    "conflictDriverCharacters": [],
    "highestInfluenceCharacter": "",
    "characterImportanceRanking": [
      {
        "name": "",
        "importance": 0,
        "reason": ""
      }
    ]
  },
  "nodes": [
    {
      "id": "",
      "name": "",
      "role": "",
      "archetype": "",
      "importance": 0,
      "plot_driver_score": 0,
      "emotion_driver_score": 0,
      "conflict_driver_score": 0,
      "adaptation_priority": "high",
      "emotionalState": "",
      "arc": "",
      "scenes": [],
      "directorNote": "",
      "position3d": {
        "x": 0,
        "y": 0,
        "z": 0
      }
    }
  ],
  "edges": [
    {
      "source": "",
      "target": "",
      "type": "emotional",
      "label": "",
      "strength": 0,
      "tension": 0,
      "directorMeaning": "",
      "relationship_evolution": {
        "stages": [
          {
            "stage_name": "",
            "trigger_event": "",
            "emotional_shift": ""
          }
        ],
        "current_stage": "",
        "potential_future": ""
      }
    }
  ],
  "report": {
    "narrativeCenter": "",
    "strongestEmotionLine": "",
    "highestConflictLine": "",
    "adaptationFocus": "",
    "directorSuggestion": ""
  }
}

原著分析结果：
${serializeInput(analysisResult)}

剧本草稿：
${serializeInput(screenplayDraft)}
`.trim();
}

import { createAdaptationPlannerPrompt } from "./adaptationPlannerPrompt.js";
import { createCharacterGraphPrompt } from "./characterGraphPrompt.js";
import { createDirectorRoomPrompt } from "./directorRoomPrompt.js";
import { createOriginalAnalyzerPrompt } from "./originalAnalyzerPrompt.js";
import { createRewritePrompt } from "./rewritePrompt.js";
import { createScreenplayWriterPrompt } from "./screenplayWriterPrompt.js";

const playgroundNovel = `
午夜的档案馆里，林照听见潮水从墙缝里涌出来。
她打开父亲留下的旧卷宗，发现每一页编号都在慢慢变成自己的生日。
门外有人敲了三下，声音很轻，却让整排铁柜同时震动。
`.trim();

const playgroundAnalysis = {
  theme: "记忆、身份与旧城真相",
  summary: "林照在档案馆发现父亲留下的卷宗被潮汐力量改写。",
  characters: [
    {
      name: "林照",
      role: "主角",
      personality: "克制、敏锐、压抑",
      emotional_state: "紧张但强行保持冷静",
      motivation: "查明父亲失踪真相",
      speech_style: "短句、低声、带警惕",
    },
  ],
  scenes: [
    {
      scene_id: "SC-001",
      location: "档案馆",
      time: "午夜",
      events: "林照发现卷宗编号变化，门外出现未知敲门声。",
      emotional_function: "建立悬疑和主角恐惧",
    },
  ],
  emotional_arc: "压抑疑惑 → 惊惧 → 决定继续追查",
  key_details: ["潮水从墙缝涌出", "编号变成生日", "三下敲门声"],
  psychology_to_externalize: [
    {
      original_psychology: "林照怀疑父亲留下的信息指向自己",
      externalization_method: "她用指腹反复摩擦卷宗编号，呼吸变慢。",
    },
  ],
  main_conflicts: ["林照与未知组织的追查冲突"],
  must_keep: ["档案馆午夜氛围", "父亲旧卷宗", "三下敲门声"],
};

const playgroundPlan = {
  must_keep_plots: ["林照发现卷宗编号变化", "门外传来三下敲门声"],
  cannot_change_behaviors: ["林照不能立刻崩溃或逃跑"],
  required_dialogues_or_expressions: ["谁？"],
  emotional_tone_keywords: ["潮湿", "压抑", "悬疑"],
  scene_plan: [
    {
      scene_id: "SC-001",
      purpose: "建立世界规则和主角危险处境",
      adaptation_strategy: "把心理恐惧转化为动作、声音和环境变化",
      must_include: ["潮水声", "卷宗编号变化", "三下敲门"],
      psychology_externalization: ["林照停住手指，盯住编号不眨眼"],
    },
  ],
  risk_notes: ["不要把未知组织解释得过早"],
  estimated_scene_count: 1,
};

const playgroundScreenplay = {
  chapter_source: "潮汐归档人",
  theme: "记忆与身份",
  emotional_arc: "克制怀疑到被迫面对危险",
  scenes: [
    {
      scene_id: "SC-001",
      heading: {
        int_ext: "INT",
        location: "档案馆",
        time: "午夜",
        atmosphere: "潮湿、昏暗、只有老旧风扇转动",
      },
      purpose: "引出潮汐档案和外部威胁",
      characters_present: [{ name: "林照", emotion_state: "警觉" }],
      action_lines: ["林照站在铁柜前，指尖停在一份被撕掉编号的卷宗上。"],
      dialogues: [{ character: "林照", parenthetical: "压低声音", line: "谁？" }],
      transition: "CUT TO",
    },
  ],
};

export function previewAnalyzerPrompt(novelText = playgroundNovel) {
  return createOriginalAnalyzerPrompt(novelText);
}

export function previewPlannerPrompt(analysisResult = playgroundAnalysis) {
  return createAdaptationPlannerPrompt(analysisResult);
}

export function previewWriterPrompt(
  novelText = playgroundNovel,
  analysisResult = playgroundAnalysis,
  adaptationPlan = playgroundPlan,
) {
  return createScreenplayWriterPrompt(novelText, analysisResult, adaptationPlan);
}

export function previewRewritePrompt(
  originalText = playgroundNovel,
  selectedStyles = ["克苏鲁风格", "心理惊悚"],
  directorPrompt = "请把这段都市奇幻故事改成更恐怖、更压抑的心理惊悚风格。",
) {
  return createRewritePrompt(originalText, selectedStyles, directorPrompt);
}

export function previewCharacterGraphPrompt(
  analysisResult = playgroundAnalysis,
  screenplayDraft = playgroundScreenplay,
) {
  return createCharacterGraphPrompt(analysisResult, screenplayDraft);
}

export function previewDirectorRoomPrompt() {
  return createDirectorRoomPrompt({
    novelText: playgroundNovel,
    analysisResult: playgroundAnalysis,
    adaptationPlan: playgroundPlan,
    screenplayDraft: playgroundScreenplay,
    reviewResult: {
      scores: {
        fidelity_score: 92,
        character_score: 88,
        emotion_score: 90,
        logic_score: 86,
      },
    },
  });
}

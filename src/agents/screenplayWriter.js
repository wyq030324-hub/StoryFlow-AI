import { agent3_writer } from "../data/mockAgentResults.js";

function normalizeScene(scene, index) {
  const heading = scene.heading || {};
  const sceneType =
    scene.scene_type ||
    scene.int_ext ||
    heading.int_ext ||
    (String(heading.int_ext || "").includes("EXT") ? "外景" : "内景");

  return {
    ...scene,
    id: scene.id || scene.scene_id || `SC-${String(index + 1).padStart(3, "0")}`,
    scene_id: scene.scene_id || scene.id || `SC-${String(index + 1).padStart(3, "0")}`,
    scene_number: scene.scene_number || scene.order || index + 1,
    scene_type: sceneType,
    int_ext: scene.int_ext || sceneType,
    location: scene.location || heading.location || "未标注地点",
    time: scene.time || scene.timeOfDay || heading.time || "未标注时间",
    action_lines: scene.action_lines || [],
    dialogues: scene.dialogues || scene.dialogue || [],
    transition: scene.transition || "CUT TO:",
  };
}

export async function runScreenplayWriter(adaptationPlan, analysisResult, novelInput) {
  return {
    ...agent3_writer,
    screenplay: agent3_writer.screenplay || {
      title: novelInput?.title || "未命名剧本",
      episode: "EP01",
      format: "professional_screenplay",
    },
    chapter_source: analysisResult.chapter_source || novelInput?.title,
    theme: analysisResult.theme,
    adaptation_strategy: adaptationPlan.adaptation_strategy,
    scenes: (agent3_writer.scenes || []).map(normalizeScene),
    ai_meta: {
      source: "mock",
      error: null,
    },
  };
}

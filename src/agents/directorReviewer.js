import { agent4_reviewer } from "../data/mockAgentResults.js";

export async function runDirectorReviewer(screenplayDraft, adaptationPlan) {
  return {
    ...agent4_reviewer,
    sceneCount: screenplayDraft?.scenes?.length || 0,
    targetFormat: adaptationPlan.target_format,
    ai_meta: {
      source: "mock",
      error: null,
    },
  };
}

import { agent2_planner } from "../data/mockAgentResults.js";

export async function runAdaptationPlanner(analysisResult) {
  return {
    ...agent2_planner,
    theme: analysisResult.theme,
    sourceConflict: analysisResult.coreConflict,
    ai_meta: {
      source: "mock",
      error: null,
    },
  };
}

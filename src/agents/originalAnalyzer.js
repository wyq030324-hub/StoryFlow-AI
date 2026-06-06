import { agent1_analyzer } from "../data/mockAgentResults.js";

export async function runOriginalAnalyzer(novelInput) {
  return {
    ...agent1_analyzer,
    chapter_source: novelInput.title
      ? `${novelInput.title} / Demo Source`
      : agent1_analyzer.chapter_source,
    sourceWordCount: novelInput.wordCount,
    sourceStyleTags: novelInput.styleTags || [],
    ai_meta: {
      source: "mock",
      error: null,
    },
  };
}

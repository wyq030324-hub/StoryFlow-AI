function createWorkflowError(message, detail = "") {
  return {
    ok: false,
    error: "REAL_AI_WORKFLOW_FAILED",
    message,
    detail,
  };
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    throw createWorkflowError(
      data?.message || "真实 AI 调用失败",
      data?.detail || data?.error || "",
    );
  }

  return data;
}

export async function runRealWorkflow(novelText) {
  const phase1 = await postJson("/api/workflow/phase1", {
    novelText,
  });

  const phase1Result = {
    analysisResult: phase1.analysisResult,
    adaptationPlan: phase1.adaptationPlan,
    screenplayDraft: phase1.screenplayDraft,
  };

  const phase2 = await postJson("/api/workflow/phase2", {
    novelText,
    phase1Result,
  });

  return {
    analysisResult: phase1.analysisResult,
    adaptationPlan: phase1.adaptationPlan,
    screenplayDraft: phase1.screenplayDraft,
    reviewResult: phase2.reviewResult,
    characterGraph: phase2.characterGraph,
    directorRoom: phase2.directorRoom,
    source: "real",
  };
}

export async function runScriptOnlyWorkflow(novelText) {
  const data = await postJson("/api/script/generate", {
    novelText,
  });

  return {
    screenplayDraft: data.screenplayDraft,
    source: "real",
  };
}

export async function runOptionalDirectorReview(novelText, screenplayDraft) {
  const data = await postJson("/api/optional/director-review", {
    novelText,
    screenplayDraft,
  });

  return data.reviewResult;
}

export async function runOptionalCharacterGraph(novelText, screenplayDraft, analysisResult = null) {
  const data = await postJson("/api/optional/character-graph", {
    novelText,
    screenplayDraft,
    analysisResult,
  });

  return data.characterGraph;
}

export async function runOptionalPlatformAnalysis(
  novelText,
  screenplayDraft,
  reviewResult = null,
  characterGraph = null,
) {
  const data = await postJson("/api/optional/platform-analysis", {
    novelText,
    screenplayDraft,
    reviewResult,
    characterGraph,
  });

  return data.directorRoom;
}

export async function runOptionalRewriteSuggestions(novelText, screenplayDraft) {
  const data = await postJson("/api/optional/rewrite-suggestions", {
    novelText,
    screenplayDraft,
  });

  return data.rewriteSuggestions;
}

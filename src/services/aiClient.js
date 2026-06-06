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

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  createAdaptationPlannerPrompt,
  createCharacterGraphPrompt,
  createDirectorReviewerPrompt,
  createDirectorRoomPrompt,
  createOriginalAnalyzerPrompt,
  createRewritePrompt,
  createScriptOnlyScreenplayPrompt,
  createScreenplayWriterPrompt,
  storyflowSystemPrompt,
  storyflowWorkflowRules,
} from "../src/prompts/index.js";
import { normalizeDeepSeekPayload } from "./utils/jsonGuard.js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.local.txt" });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const deepSeekBaseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const deepSeekModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const useMock = String(process.env.USE_MOCK ?? "true").toLowerCase() !== "false";

app.use(
  cors({
    origin: [/^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/localhost:\d+$/],
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use((error, _request, response, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({
      ok: false,
      error: "INVALID_JSON_BODY",
      message: "请求体不是合法 JSON",
    });
    return;
  }

  next(error);
});

function ensureNovelText(novelText) {
  if (!String(novelText || "").trim()) {
    return {
      ok: false,
      error: "NOVEL_TEXT_REQUIRED",
      message: "请输入小说内容后再启动真实 AI 工作流",
    };
  }

  return null;
}

function createModeDisabledError() {
  return {
    ok: false,
    error: "REAL_AI_DISABLED",
    message: "当前 server 仍处于 Demo Mode。请在 .env.local 中设置 USE_MOCK=false 并填写 DEEPSEEK_API_KEY。",
  };
}

function createRequestError(message) {
  return {
    ok: false,
    error: "DEEPSEEK_REQUEST_FAILED",
    message,
  };
}

function buildPhaseHeader(title) {
  return [
    storyflowSystemPrompt,
    storyflowWorkflowRules,
    `你正在执行 StoryFlow AI 的 ${title}。`,
    "只返回合法 JSON。",
    "不要输出 Markdown。",
    "不要输出解释文字。",
    "不要输出代码块。",
    "字段名必须固定。",
    "数组尽量不要为空；信息不足时请基于原文做合理推断。",
  ].join("\n\n");
}

async function callDeepSeek(prompt, agentName) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw createRequestError("未检测到 DEEPSEEK_API_KEY，请检查 .env.local 配置。");
  }

  const response = await fetch(`${deepSeekBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: deepSeekModel,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are StoryFlow AI. Return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      metadata: {
        agentName,
      },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw createRequestError(
      payload?.error?.message || `DeepSeek 请求失败，状态码 ${response.status}`,
    );
  }

  const normalized = normalizeDeepSeekPayload(payload);

  if (!normalized.ok) {
    throw normalized;
  }

  return normalized.data;
}

async function runPhase1Workflow(novelText) {
  const analysisResult = await callDeepSeek(
    [
      buildPhaseHeader("phase1 / 原著分析"),
      createOriginalAnalyzerPrompt(novelText),
    ].join("\n\n"),
    "originalAnalyzer",
  );

  const adaptationPlan = await callDeepSeek(
    [
      buildPhaseHeader("phase1 / 改编规划"),
      createAdaptationPlannerPrompt(analysisResult),
    ].join("\n\n"),
    "adaptationPlanner",
  );

  const screenplayDraft = await callDeepSeek(
    [
      buildPhaseHeader("phase1 / 专业剧本生成"),
      createScreenplayWriterPrompt(novelText, analysisResult, adaptationPlan),
    ].join("\n\n"),
    "screenplayWriter",
  );

  return {
    analysisResult,
    adaptationPlan,
    screenplayDraft,
  };
}

async function runPhase2Workflow(novelText, phase1Result) {
  const reviewResult = await callDeepSeek(
    [
      buildPhaseHeader("phase2 / 导演审查"),
      createDirectorReviewerPrompt(novelText, phase1Result.screenplayDraft),
    ].join("\n\n"),
    "directorReviewer",
  );

  const characterGraph = await callDeepSeek(
    [
      buildPhaseHeader("phase2 / 人物图谱"),
      createCharacterGraphPrompt(phase1Result.analysisResult, phase1Result.screenplayDraft),
    ].join("\n\n"),
    "characterGraph",
  );

  const directorRoom = await callDeepSeek(
    [
      buildPhaseHeader("phase2 / Director Room"),
      createDirectorRoomPrompt({
        novelText,
        analysisResult: phase1Result.analysisResult,
        adaptationPlan: phase1Result.adaptationPlan,
        screenplayDraft: phase1Result.screenplayDraft,
        reviewResult,
        characterGraph,
      }),
    ].join("\n\n"),
    "directorRoom",
  );

  return {
    reviewResult,
    characterGraph,
    directorRoom,
  };
}

async function runScriptOnlyWorkflow(novelText) {
  const scriptResult = await callDeepSeek(
    [
      "StoryFlow AI / script-only generation",
      "只执行剧本正文生成，不执行人物图谱、导演审查、平台分析或改写建议。",
      "只返回合法 JSON。",
      createScriptOnlyScreenplayPrompt(novelText),
    ].join("\n\n"),
    "scriptOnlyWriter",
  );

  const screenplayText =
    scriptResult?.screenplayText ||
    scriptResult?.screenplay_text ||
    scriptResult?.script ||
    scriptResult?.content ||
    "";

  return {
    screenplayDraft: {
      screenplay: {
        title: "AI 改编剧本",
        format: "script_only_screenplay",
      },
      chapter_source: "用户输入小说",
      screenplayText,
      scenes: Array.isArray(scriptResult?.scenes) ? scriptResult.scenes : [],
      ai_meta: {
        source: "deepseek",
        mode: "script_only",
      },
    },
  };
}

async function runOptionalDirectorReview(novelText, screenplayDraft) {
  return callDeepSeek(
    [
      buildPhaseHeader("optional / 导演审查"),
      createDirectorReviewerPrompt(novelText, screenplayDraft),
    ].join("\n\n"),
    "optionalDirectorReviewer",
  );
}

async function runOptionalCharacterGraph(novelText, screenplayDraft, analysisResult = null) {
  const fallbackAnalysis = analysisResult || {
    chapter_source: "用户输入小说",
    theme: "",
    summary: novelText.slice(0, 500),
    characters: [],
  };

  return callDeepSeek(
    [
      buildPhaseHeader("optional / 人物情感宇宙"),
      createCharacterGraphPrompt(fallbackAnalysis, screenplayDraft),
    ].join("\n\n"),
    "optionalCharacterGraph",
  );
}

async function runOptionalDirectorRoom({
  novelText,
  screenplayDraft,
  reviewResult = null,
  characterGraph = null,
}) {
  return callDeepSeek(
    [
      buildPhaseHeader("optional / 平台分析"),
      createDirectorRoomPrompt({
        novelText,
        analysisResult: null,
        adaptationPlan: null,
        screenplayDraft,
        reviewResult,
        characterGraph,
      }),
    ].join("\n\n"),
    "optionalDirectorRoom",
  );
}

async function runOptionalRewriteSuggestions(novelText, screenplayDraft) {
  return callDeepSeek(
    [
      buildPhaseHeader("optional / 改写建议"),
      createRewritePrompt(
        novelText,
        ["短剧强化", "悬念强化"],
        "基于当前剧本，给出可执行的改写方向和关键片段建议。",
        45,
        70,
      ),
      "当前剧本：",
      JSON.stringify(screenplayDraft || {}, null, 2),
    ].join("\n\n"),
    "optionalRewriteSuggestions",
  );
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    provider: "deepseek",
    useMock,
    model: deepSeekModel,
  });
});

app.post("/api/workflow/phase1", async (request, response) => {
  const { novelText = "" } = request.body || {};
  const validationError = ensureNovelText(novelText);

  if (validationError) {
    response.status(400).json(validationError);
    return;
  }

  if (useMock) {
    response.status(503).json(createModeDisabledError());
    return;
  }

  try {
    const result = await runPhase1Workflow(novelText);
    response.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    response.status(502).json({
      ok: false,
      error: error?.error || "DEEPSEEK_REQUEST_FAILED",
      message: error?.message || "phase1 调用失败",
      detail: error?.detail || "",
    });
  }
});

app.post("/api/script/generate", async (request, response) => {
  const { novelText = "" } = request.body || {};
  const validationError = ensureNovelText(novelText);

  if (validationError) {
    response.status(400).json(validationError);
    return;
  }

  if (useMock) {
    response.status(503).json(createModeDisabledError());
    return;
  }

  try {
    const result = await runScriptOnlyWorkflow(novelText);
    response.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    response.status(502).json({
      ok: false,
      error: error?.error || "DEEPSEEK_REQUEST_FAILED",
      message: error?.message || "剧本生成调用失败",
      detail: error?.detail || "",
    });
  }
});

app.post("/api/workflow/phase2", async (request, response) => {
  const { novelText = "", phase1Result = null } = request.body || {};
  const validationError = ensureNovelText(novelText);

  if (validationError) {
    response.status(400).json(validationError);
    return;
  }

  if (!phase1Result?.analysisResult || !phase1Result?.adaptationPlan || !phase1Result?.screenplayDraft) {
    response.status(400).json({
      ok: false,
      error: "PHASE1_RESULT_REQUIRED",
      message: "phase2 需要完整的 phase1Result",
    });
    return;
  }

  if (useMock) {
    response.status(503).json(createModeDisabledError());
    return;
  }

  try {
    const result = await runPhase2Workflow(novelText, phase1Result);
    response.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    response.status(502).json({
      ok: false,
      error: error?.error || "DEEPSEEK_REQUEST_FAILED",
      message: error?.message || "phase2 调用失败",
      detail: error?.detail || "",
    });
  }
});

app.post("/api/optional/director-review", async (request, response) => {
  const { novelText = "", screenplayDraft = null } = request.body || {};
  const validationError = ensureNovelText(novelText);

  if (validationError) {
    response.status(400).json(validationError);
    return;
  }

  if (!screenplayDraft) {
    response.status(400).json({
      ok: false,
      error: "SCREENPLAY_REQUIRED",
      message: "请先生成剧本，再生成导演审查。",
    });
    return;
  }

  if (useMock) {
    response.status(503).json(createModeDisabledError());
    return;
  }

  try {
    const reviewResult = await runOptionalDirectorReview(novelText, screenplayDraft);
    response.json({ ok: true, reviewResult });
  } catch (error) {
    response.status(502).json({
      ok: false,
      error: error?.error || "DEEPSEEK_REQUEST_FAILED",
      message: error?.message || "导演审查调用失败",
      detail: error?.detail || "",
    });
  }
});

app.post("/api/optional/character-graph", async (request, response) => {
  const { novelText = "", screenplayDraft = null, analysisResult = null } = request.body || {};
  const validationError = ensureNovelText(novelText);

  if (validationError) {
    response.status(400).json(validationError);
    return;
  }

  if (!screenplayDraft) {
    response.status(400).json({
      ok: false,
      error: "SCREENPLAY_REQUIRED",
      message: "请先生成剧本，再生成人物情感宇宙。",
    });
    return;
  }

  if (useMock) {
    response.status(503).json(createModeDisabledError());
    return;
  }

  try {
    const characterGraph = await runOptionalCharacterGraph(
      novelText,
      screenplayDraft,
      analysisResult,
    );
    response.json({ ok: true, characterGraph });
  } catch (error) {
    response.status(502).json({
      ok: false,
      error: error?.error || "DEEPSEEK_REQUEST_FAILED",
      message: error?.message || "人物情感宇宙调用失败",
      detail: error?.detail || "",
    });
  }
});

app.post("/api/optional/platform-analysis", async (request, response) => {
  const {
    novelText = "",
    screenplayDraft = null,
    reviewResult = null,
    characterGraph = null,
  } = request.body || {};
  const validationError = ensureNovelText(novelText);

  if (validationError) {
    response.status(400).json(validationError);
    return;
  }

  if (!screenplayDraft) {
    response.status(400).json({
      ok: false,
      error: "SCREENPLAY_REQUIRED",
      message: "请先生成剧本，再生成平台分析。",
    });
    return;
  }

  if (useMock) {
    response.status(503).json(createModeDisabledError());
    return;
  }

  try {
    const directorRoom = await runOptionalDirectorRoom({
      novelText,
      screenplayDraft,
      reviewResult,
      characterGraph,
    });
    response.json({ ok: true, directorRoom });
  } catch (error) {
    response.status(502).json({
      ok: false,
      error: error?.error || "DEEPSEEK_REQUEST_FAILED",
      message: error?.message || "平台分析调用失败",
      detail: error?.detail || "",
    });
  }
});

app.post("/api/optional/rewrite-suggestions", async (request, response) => {
  const { novelText = "", screenplayDraft = null } = request.body || {};
  const validationError = ensureNovelText(novelText);

  if (validationError) {
    response.status(400).json(validationError);
    return;
  }

  if (!screenplayDraft) {
    response.status(400).json({
      ok: false,
      error: "SCREENPLAY_REQUIRED",
      message: "请先生成剧本，再生成改写建议。",
    });
    return;
  }

  if (useMock) {
    response.status(503).json(createModeDisabledError());
    return;
  }

  try {
    const rewriteSuggestions = await runOptionalRewriteSuggestions(novelText, screenplayDraft);
    response.json({ ok: true, rewriteSuggestions });
  } catch (error) {
    response.status(502).json({
      ok: false,
      error: error?.error || "DEEPSEEK_REQUEST_FAILED",
      message: error?.message || "改写建议调用失败",
      detail: error?.detail || "",
    });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`StoryFlow AI proxy running at http://127.0.0.1:${port}`);
  console.log(`USE_MOCK=${useMock}`);
  console.log(`DEEPSEEK_MODEL=${deepSeekModel}`);
});

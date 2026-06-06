import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  createAdaptationPlannerPrompt,
  createCharacterGraphPrompt,
  createDirectorReviewerPrompt,
  createDirectorRoomPrompt,
  createOriginalAnalyzerPrompt,
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

app.listen(port, "127.0.0.1", () => {
  console.log(`StoryFlow AI proxy running at http://127.0.0.1:${port}`);
  console.log(`USE_MOCK=${useMock}`);
  console.log(`DEEPSEEK_MODEL=${deepSeekModel}`);
});

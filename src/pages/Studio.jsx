import {
  Activity,
  BadgeCheck,
  CheckCircle2,
  Clipboard,
  Database,
  Download,
  Eraser,
  FileCode2,
  FileUp,
  GitCompare,
  Loader2,
  PlayCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wand2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { runDirectorReviewer } from "../agents/directorReviewer.js";
import { runScreenplayWriter } from "../agents/screenplayWriter.js";
import { characterGraph as mockCharacterGraph } from "../data/characterGraph.js";
import { AGENT_KEYS, storyActionTypes, useStory } from "../context/StoryContext.jsx";
import {
  runOptionalCharacterGraph,
  runOptionalDirectorReview,
  runOptionalPlatformAnalysis,
  runOptionalRewriteSuggestions,
  runScriptOnlyWorkflow,
} from "../services/aiClient.js";
import {
  downloadTextFile,
  formatScreenplay,
} from "../utils/screenplayFormatter.js";
import { generateYaml } from "../utils/yamlFormatter.js";

const statusClass = {
  waiting: "border-story-border text-story-muted",
  running:
    "animate-pulse border-story-gold bg-story-gold/10 text-story-gold shadow-[0_0_30px_rgba(201,169,110,0.16)]",
  done: "border-story-success bg-story-success/10 text-story-success",
  error: "border-red-400 bg-red-950/20 text-red-300",
};

const statusLabel = {
  waiting: "等待中",
  running: "创作中",
  done: "已完成",
  error: "失败",
};

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getDialogues(scene) {
  return scene?.dialogues || scene?.dialogue || [];
}

function getIssues(reviewResult) {
  const issues = reviewResult?.issues || reviewResult?.riskFlags || [];

  return issues.map((issue) => {
    if (typeof issue === "string") {
      return {
        problem: issue,
        suggestion: "",
        scene_id: "",
      };
    }

    return issue;
  });
}

function getSuggestions(reviewResult) {
  return reviewResult?.suggestions || reviewResult?.revisionSuggestions || [];
}

function getScoreCards(reviewResult) {
  const scores = reviewResult?.scores || {};

  return [
    ["忠实度", scores.fidelity_score],
    ["人物一致性", scores.character_score],
    ["情感还原度", scores.emotion_score],
    ["逻辑完整度", scores.logic_score],
  ].map(([label, value]) => ({
    label,
    value: typeof value === "number" ? value : "待评估",
  }));
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-story-muted">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-story-gold/30 bg-story-bg text-story-gold">
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 font-serif text-4xl font-semibold text-story-gold">{value}</p>
    </article>
  );
}

function ModeSwitch({ value, onChange, disabled }) {
  const options = [
    ["real", "AI 创作模式", "根据输入内容生成剧本"],
    ["mock", "演示模式", "使用内置示例快速体验流程"],
  ];

  return (
    <div className="rounded-xl border border-story-border bg-story-bg/80 p-4">
      <p className="text-xs text-story-muted">创作模式</p>
      <div className="mt-3 grid gap-2">
        {options.map(([mode, label, description]) => (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mode)}
            className={`rounded-lg border px-3 py-3 text-left text-sm transition ${
              value === mode
                ? "border-story-gold bg-story-gold/10 text-story-gold"
                : "border-story-border text-story-muted hover:border-story-gold/60 hover:text-story-text"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span className="block font-medium">{label}</span>
            <span className="mt-1 block text-xs text-story-muted">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionalResultBlock({ title, children }) {
  return (
    <article className="rounded-lg border border-story-border bg-story-bg/70 p-4 text-sm leading-7 text-story-muted">
      <h3 className="font-serif text-lg text-story-text">{title}</h3>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function Studio() {
  const { state, dispatch } = useStory();
  const [aiMode, setAiMode] = useState("real");
  const [copyState, setCopyState] = useState("idle");
  const [scriptCopyState, setScriptCopyState] = useState("idle");
  const [isYamlVisible, setIsYamlVisible] = useState(false);
  const [optionalLoading, setOptionalLoading] = useState(null);
  const [uploadHint, setUploadHint] = useState("");
  const screenplayRef = useRef(null);
  const fileInputRef = useRef(null);

  const isRunning = state.agentStatus[AGENT_KEYS.screenplayWriter] === "running";
  const canStart = Boolean(state.novelInput.content.trim()) && !isRunning;
  const scriptText = useMemo(
    () => formatScreenplay(state.screenplayDraft),
    [state.screenplayDraft],
  );
  const scenes = state.screenplayDraft?.scenes || state.scenes || [];
  const dialogueCount = scenes.reduce((total, scene) => total + getDialogues(scene).length, 0);
  const characterCount =
    state.characterGraph?.nodes?.length ||
    state.analysisResult?.characters?.length ||
    new Set(scenes.flatMap((scene) => scene.characters || scene.characters_present || [])).size;
  const reviewScores = Object.values(state.reviewResult?.scores || {}).filter(
    (score) => typeof score === "number",
  );
  const adaptationScore = reviewScores.length
    ? Math.round(reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length)
    : "待评估";

  const pipelineSteps = [
    {
      id: "input",
      index: "01",
      label: "小说输入",
      description: "粘贴或导入原文",
      status: state.novelInput.content.trim() ? "done" : "waiting",
    },
    {
      id: "script",
      index: "02",
      label: "剧本生成",
      description: "改编为影视剧本",
      status: state.agentStatus[AGENT_KEYS.screenplayWriter] || "waiting",
    },
    {
      id: "output",
      index: "03",
      label: "结果输出",
      description: "查看、复制与导出",
      status: scriptText ? "done" : "waiting",
    },
  ];

  function updateNovelInput(payload) {
    dispatch({
      type: storyActionTypes.SET_NOVEL_INPUT,
      payload,
    });
  }

  function loadDemo() {
    dispatch({ type: storyActionTypes.LOAD_DEMO });
    setCopyState("idle");
    setScriptCopyState("idle");
    setIsYamlVisible(false);
    setUploadHint("");
  }

  function clearNovelInput() {
    dispatch({
      type: storyActionTypes.SET_NOVEL_INPUT,
      payload: {
        title: "",
        content: "",
        paragraphs: [],
        source: "manual",
        wordCount: 0,
        styleTags: [],
      },
    });
    dispatch({ type: storyActionTypes.RESET_WORKFLOW });
    setCopyState("idle");
    setScriptCopyState("idle");
    setIsYamlVisible(false);
    setUploadHint("");
  }

  async function handleDocumentUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "txt") {
      const content = await file.text();
      updateNovelInput({
        title: state.novelInput.title || file.name.replace(/\.txt$/i, ""),
        content,
        source: "upload",
      });
      setUploadHint("文档内容已导入，可继续编辑后生成剧本。");
      return;
    }

    if (extension === "docx") {
      setUploadHint("Word 文档导入已预留，当前版本请先复制正文或上传 TXT 文档。");
      return;
    }

    setUploadHint("当前支持 TXT 文档。Word 文档可先复制正文到输入框。");
  }

  async function runDemoScriptOnly() {
    await delay(500);
    return runScreenplayWriter(
      {
        adaptation_strategy: "保留核心悬疑主线，转化为可拍摄的短剧场景。",
      },
      {
        chapter_source: state.novelInput.title,
        theme: "记忆、潮汐与自我追寻",
      },
      state.novelInput,
    );
  }

  async function startWorkflow() {
    if (!state.novelInput.content.trim()) {
      dispatch({
        type: storyActionTypes.SET_AGENT_ERROR,
        payload: {
          agent: AGENT_KEYS.screenplayWriter,
          error: "请先输入小说内容，或点击加载示例小说。",
        },
      });
      return;
    }

    try {
      dispatch({ type: storyActionTypes.START_WORKFLOW });
      dispatch({ type: storyActionTypes.SET_AGENT_RUNNING, payload: AGENT_KEYS.screenplayWriter });
      setCopyState("idle");
      setScriptCopyState("idle");
      setIsYamlVisible(false);

      const result =
        aiMode === "real"
          ? await runScriptOnlyWorkflow(state.novelInput.content)
          : { screenplayDraft: await runDemoScriptOnly() };

      dispatch({
        type: storyActionTypes.SET_SCREENPLAY_DRAFT,
        payload: result.screenplayDraft,
      });
      dispatch({ type: storyActionTypes.SET_AGENT_DONE, payload: AGENT_KEYS.screenplayWriter });
    } catch (error) {
      dispatch({
        type: storyActionTypes.SET_AGENT_ERROR,
        payload: {
          agent: AGENT_KEYS.screenplayWriter,
          error: error.message || "剧本生成失败，请确认创作服务已启动并稍后重试。",
        },
      });
    }
  }

  async function runOptionalTask(kind) {
    if (!state.screenplayDraft) {
      dispatch({
        type: storyActionTypes.SET_AGENT_ERROR,
        payload: {
          agent: AGENT_KEYS.screenplayWriter,
          error: "请先生成剧本，再使用增强分析能力。",
        },
      });
      return;
    }

    setOptionalLoading(kind);

    try {
      if (kind === "characterGraph") {
        const result =
          aiMode === "real"
            ? await runOptionalCharacterGraph(
                state.novelInput.content,
                state.screenplayDraft,
                state.analysisResult,
              )
            : mockCharacterGraph;
        dispatch({ type: storyActionTypes.SET_CHARACTER_GRAPH, payload: result });
      }

      if (kind === "directorReview") {
        const result =
          aiMode === "real"
            ? await runOptionalDirectorReview(state.novelInput.content, state.screenplayDraft)
            : await runDirectorReviewer(state.screenplayDraft, state.adaptationPlan || {});
        dispatch({ type: storyActionTypes.SET_REVIEW_RESULT, payload: result });
      }

      if (kind === "platformAnalysis") {
        const result =
          aiMode === "real"
            ? await runOptionalPlatformAnalysis(
                state.novelInput.content,
                state.screenplayDraft,
                state.reviewResult,
                state.characterGraph,
              )
            : {
                short_drama_score: 86,
                platform_analysis: {
                  overall_recommendation:
                    "适合悬疑短剧化，建议每集结尾保留一个记忆被改写的强钩子。",
                },
              };
        dispatch({ type: storyActionTypes.SET_DIRECTOR_ROOM, payload: result });
      }

      if (kind === "rewriteSuggestions") {
        const result =
          aiMode === "real"
            ? await runOptionalRewriteSuggestions(state.novelInput.content, state.screenplayDraft)
            : {
                new_style_positioning: "悬疑短剧强化版",
                new_core_conflict: "主角必须在亲情真相与城市规则之间做选择。",
                director_notes: [
                  "把第一场结尾改成更强钩子。",
                  "提前让反派力量产生可见后果。",
                  "减少规则解释，用动作与道具承载信息。",
                ],
              };
        dispatch({ type: storyActionTypes.SET_REWRITE_SUGGESTIONS, payload: result });
      }
    } catch (error) {
      dispatch({
        type: storyActionTypes.SET_AGENT_ERROR,
        payload: {
          agent: AGENT_KEYS.screenplayWriter,
          error: error.message || "增强分析生成失败，请稍后重试。",
        },
      });
    } finally {
      setOptionalLoading(null);
    }
  }

  async function copyText(text, setState) {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setState("copied");
    window.setTimeout(() => setState("idle"), 1800);
  }

  function exportMarkdown() {
    const title = state.screenplayDraft?.screenplay?.title || state.novelInput.title || "StoryFlow 剧本";
    downloadTextFile("storyflow-screenplay.md", `# ${title}\n\n${scriptText}`);
  }

  function scrollToScreenplay() {
    screenplayRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function toggleYaml() {
    if (!state.generatedYaml && state.screenplayDraft) {
      dispatch({
        type: storyActionTypes.SET_GENERATED_YAML,
        payload: generateYaml(state.screenplayDraft, state.reviewResult),
      });
    }

    setIsYamlVisible((visible) => !visible);
  }

  return (
    <div className="space-y-8">
      {state.error ? (
        <section className="flex flex-col gap-3 rounded-lg border border-red-400 bg-red-950/20 px-4 py-3 text-sm text-red-300 md:flex-row md:items-center md:justify-between">
          <p>{state.error}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: storyActionTypes.RESET_WORKFLOW })}
            className="self-start rounded-md border border-red-400/50 p-1 transition hover:bg-red-400/10 md:self-auto"
            aria-label="关闭错误提示"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </section>
      ) : null}

      <section className="rounded-xl border border-story-border bg-story-card/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-story-border bg-story-bg px-3 py-1 text-xs text-story-muted">
              <Sparkles size={14} className="text-story-gold" aria-hidden="true" />
              AI 编剧工作台
            </div>
            <h1 className="mt-4 font-serif text-3xl font-semibold md:text-5xl">
              输入小说，生成专业影视剧本
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-story-muted md:text-base md:leading-8">
              从小说章节、故事梗概或剧情片段出发，快速生成可继续打磨的剧本初稿，并按创作需要扩展人物分析、导演审查、平台适配和创意重构。
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border bg-story-bg px-4 py-3 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold"
          >
            返回首页
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-story-gold">Novel Input</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold">小说输入区</h2>
              <p className="mt-2 text-sm leading-6 text-story-muted">
                支持手动粘贴或上传文本文件。导入后仍可继续修改，再生成剧本。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx"
                onChange={handleDocumentUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRunning}
                className="inline-flex items-center gap-2 rounded-md border border-story-border bg-story-bg px-4 py-3 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileUp size={16} aria-hidden="true" />
                上传文档
              </button>
              <button
                type="button"
                onClick={loadDemo}
                disabled={isRunning}
                className="inline-flex items-center gap-2 rounded-md border border-story-border bg-story-bg px-4 py-3 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Database size={16} aria-hidden="true" />
                加载示例小说
              </button>
              <button
                type="button"
                onClick={clearNovelInput}
                disabled={isRunning}
                className="inline-flex items-center gap-2 rounded-md border border-story-border bg-story-bg px-4 py-3 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eraser size={16} aria-hidden="true" />
                清空文本
              </button>
              <button
                type="button"
                onClick={startWorkflow}
                disabled={!canStart}
                className="inline-flex items-center gap-2 rounded-md bg-story-gold px-5 py-3 text-sm font-semibold text-story-bg shadow-[0_0_30px_rgba(201,169,110,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <PlayCircle size={16} aria-hidden="true" />
                )}
                生成剧本
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-story-muted">支持 TXT / Word。当前 TXT 可直接导入，Word 可复制正文后粘贴。</p>
          {uploadHint ? (
            <p className="mt-2 rounded-md border border-story-gold/40 bg-story-gold/10 px-3 py-2 text-xs text-story-gold">
              {uploadHint}
            </p>
          ) : null}

          <label htmlFor="novel-title" className="mt-6 block text-sm font-medium text-story-text">
            小说标题
          </label>
          <input
            id="novel-title"
            value={state.novelInput.title}
            onChange={(event) => updateNovelInput({ title: event.target.value })}
            disabled={isRunning}
            className="mt-2 w-full rounded-md border border-story-border bg-story-bg px-3 py-2 text-story-text outline-none transition placeholder:text-story-muted focus:border-story-gold disabled:opacity-60"
            placeholder="输入作品标题或章节名"
          />

          <label htmlFor="novel-content" className="mt-5 block text-sm font-medium text-story-text">
            小说正文
          </label>
          <textarea
            id="novel-content"
            value={state.novelInput.content}
            onChange={(event) => updateNovelInput({ content: event.target.value })}
            disabled={isRunning}
            rows={14}
            className="mt-2 w-full resize-y rounded-md border border-story-border bg-story-bg px-3 py-3 text-sm leading-7 text-story-text outline-none transition placeholder:text-story-muted focus:border-story-gold disabled:opacity-60"
            placeholder="粘贴小说片段，或上传 TXT 文档"
          />
        </article>

        <ModeSwitch value={aiMode} onChange={setAiMode} disabled={isRunning} />
      </section>

      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-story-gold">Creation Flow</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">创作流程</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <p className="text-sm text-story-muted">
              当前模式：{aiMode === "real" ? "AI 创作模式" : "演示模式"}
            </p>
            {scriptText ? (
              <button
                type="button"
                onClick={scrollToScreenplay}
                className="rounded-md border border-story-gold/70 px-4 py-2 text-sm text-story-gold transition hover:bg-story-gold/10"
              >
                查看完整剧本
              </button>
            ) : null}
          </div>
        </div>

        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {pipelineSteps.map((step) => {
            const status = step.status || "waiting";

            return (
              <li
                key={step.id}
                className={`relative overflow-hidden rounded-lg border px-4 py-4 text-sm transition ${
                  statusClass[status] || statusClass.waiting
                }`}
              >
                {status === "running" ? (
                  <span
                    className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-[3px] rounded-full bg-gradient-to-b from-transparent via-story-gold to-transparent opacity-90 animate-pulse"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="text-xs text-story-muted">{step.index}</span>
                <p className="mt-2 font-medium">{step.label}</p>
                <p className="mt-1 text-xs text-story-muted">{step.description}</p>
                <p className="mt-3 text-xs">{statusLabel[status] || status}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 rounded-lg border border-story-border bg-story-bg/70 p-4">
          <p className="text-sm text-story-muted">执行状态</p>
          <p className="mt-2 text-sm text-story-text">
            {isRunning
              ? "正在生成剧本，请稍候……"
              : scriptText
                ? "剧本已生成。你可以继续查看完整剧本，或根据创作需要选择增强分析能力。"
                : "请输入小说内容并点击生成剧本。"}
          </p>
        </div>
      </section>

      <section
        ref={screenplayRef}
        className="scroll-mt-6 rounded-xl border border-story-gold/50 bg-story-card/95 p-5 shadow-[0_26px_100px_rgba(201,169,110,0.12)]"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-story-gold">Professional Screenplay</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold">完整剧本</h2>
            <p className="mt-1 text-sm text-story-muted">
              以影视剧本格式展示，可复制、导出并继续修改。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(scriptText, setScriptCopyState)}
              disabled={!scriptText}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border px-4 py-2 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {scriptCopyState === "copied" ? (
                <CheckCircle2 size={16} aria-hidden="true" />
              ) : (
                <Clipboard size={16} aria-hidden="true" />
              )}
              {scriptCopyState === "copied" ? "已复制" : "复制剧本"}
            </button>
            <button
              type="button"
              onClick={() => downloadTextFile("storyflow-screenplay.txt", scriptText)}
              disabled={!scriptText}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border px-4 py-2 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} aria-hidden="true" />
              导出 TXT
            </button>
            <button
              type="button"
              onClick={exportMarkdown}
              disabled={!scriptText}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border px-4 py-2 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} aria-hidden="true" />
              导出 Markdown
            </button>
          </div>
        </div>

        {!scriptText ? (
          <div className="mt-5 rounded-lg border border-story-border bg-story-bg/70 p-6 text-sm text-story-muted">
            请先加载示例小说或输入新小说，然后点击生成剧本。
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg border border-story-gold/40 bg-story-bg">
            <div className="border-b border-story-border bg-story-card/80 px-4 py-4">
              <h3 className="font-serif text-2xl font-semibold">
                《{state.screenplayDraft?.screenplay?.title || state.novelInput.title || "未命名剧本"}》
              </h3>
            </div>
            <pre className="max-h-[760px] overflow-auto whitespace-pre-wrap break-words px-4 py-5 font-mono text-sm leading-8 text-story-text">
              {scriptText}
            </pre>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-story-gold">Creative Extensions</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">增强分析</h2>
            <p className="mt-2 text-sm leading-6 text-story-muted">
              根据创作需要选择增强分析能力。
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            ["characterGraph", UsersRound, "生成人物情感宇宙"],
            ["directorReview", ShieldCheck, "生成导演审查"],
            ["platformAnalysis", Activity, "生成平台分析"],
            ["rewriteSuggestions", Wand2, "生成改写建议"],
          ].map(([kind, Icon, label]) => (
            <button
              key={kind}
              type="button"
              disabled={!scriptText || Boolean(optionalLoading)}
              onClick={() => runOptionalTask(kind)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border bg-story-bg px-4 py-3 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {optionalLoading === kind ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Icon size={16} aria-hidden="true" />
              )}
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {state.characterGraph ? (
            <OptionalResultBlock title="人物情感宇宙已生成">
              <p>已生成 {state.characterGraph.nodes?.length || 0} 个人物节点和 {state.characterGraph.edges?.length || 0} 条关系线。</p>
              <Link className="mt-3 inline-flex text-story-gold hover:underline" to="/characters">
                前往人物感情线
              </Link>
            </OptionalResultBlock>
          ) : null}

          {state.reviewResult ? (
            <OptionalResultBlock title="导演审查已生成">
              <div className="grid gap-3 sm:grid-cols-4">
                {getScoreCards(state.reviewResult).map((card) => (
                  <div key={card.label} className="rounded-md border border-story-border p-3">
                    <p className="text-xs text-story-muted">{card.label}</p>
                    <p className="mt-1 font-serif text-2xl text-story-gold">{card.value}</p>
                  </div>
                ))}
              </div>
              <Link className="mt-3 inline-flex text-story-gold hover:underline" to="/review">
                查看导演审查报告
              </Link>
            </OptionalResultBlock>
          ) : null}

          {state.directorRoom ? (
            <OptionalResultBlock title="平台分析已生成">
              <p>短剧评分：{state.directorRoom.short_drama_score || "待评估"}</p>
              <p className="mt-2">
                {state.directorRoom.platform_analysis?.overall_recommendation ||
                  state.directorRoom.director_notes?.[0] ||
                  "已生成平台适配分析。"}
              </p>
            </OptionalResultBlock>
          ) : null}

          {state.rewriteSuggestions ? (
            <OptionalResultBlock title="改写建议已生成">
              <p>
                {state.rewriteSuggestions.new_style_positioning ||
                  state.rewriteSuggestions.new_core_conflict ||
                  "已生成改写建议。"}
              </p>
            </OptionalResultBlock>
          ) : null}
        </div>
      </section>

      {state.reviewResult ? (
        <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-story-gold">Director Review</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold">导演审查摘要</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="font-serif text-xl text-story-text">问题清单</h3>
              <div className="mt-3 space-y-3">
                {getIssues(state.reviewResult).length ? (
                  getIssues(state.reviewResult).map((issue, index) => (
                    <article
                      key={`${issue.scene_id || "issue"}-${index}`}
                      className="rounded-lg border border-story-border bg-story-bg/80 p-4 text-sm leading-6 text-story-muted"
                    >
                      <p className="text-story-text">{issue.problem || issue.type}</p>
                      {issue.suggestion ? (
                        <p className="mt-2 text-story-gold">{issue.suggestion}</p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-story-muted">暂无明显问题。</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl text-story-text">修正建议</h3>
              <div className="mt-3 space-y-3">
                {getSuggestions(state.reviewResult).length ? (
                  getSuggestions(state.reviewResult).map((suggestion) => (
                    <p
                      key={suggestion}
                      className="rounded-lg border border-story-border bg-story-bg/80 p-4 text-sm leading-6 text-story-muted"
                    >
                      {suggestion}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-story-muted">暂无修正建议。</p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4">
          <p className="text-sm text-story-gold">Overview</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold">项目数据概览</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="人物数" value={characterCount} icon={UsersRound} />
          <StatCard label="场景数" value={scenes.length || "文本"} icon={ScrollText} />
          <StatCard label="对白数" value={dialogueCount || "待解析"} icon={Clipboard} />
          <StatCard
            label="情感峰值"
            value={state.reviewResult?.scores?.emotion_score || "待检测"}
            icon={Activity}
          />
          <StatCard label="改编评分" value={adaptationScore} icon={BadgeCheck} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ["/characters", UsersRound, "人物感情线", "查看角色关系与叙事图谱"],
          ["/rewrite", Wand2, "创意重构", "尝试不同导演风格"],
          ["/comparison", GitCompare, "原著对照", "支持从原著到剧本的对照编辑"],
          ["/review", ScrollText, "导演审查", "阅读专业审查建议"],
        ].map(([path, Icon, title, desc]) => (
          <Link
            key={path}
            to={path}
            className="rounded-xl border border-story-border bg-story-card/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)] transition hover:border-story-gold hover:text-story-gold"
          >
            <Icon size={18} className="text-story-gold" aria-hidden="true" />
            <h3 className="mt-3 font-serif text-xl text-story-text">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-story-muted">{desc}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-story-muted">结构化交付</p>
            <h2 className="font-serif text-2xl font-semibold">YAML 导出</h2>
            <p className="mt-1 text-sm text-story-muted">
              用于后续分镜、配音、短剧制作和团队协作。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleYaml}
              disabled={!state.screenplayDraft}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border px-4 py-2 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileCode2 size={16} aria-hidden="true" />
              {isYamlVisible ? "收起 YAML" : "查看 YAML"}
            </button>
            <button
              type="button"
              onClick={() => copyText(state.generatedYaml, setCopyState)}
              disabled={!state.generatedYaml}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border px-4 py-2 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copyState === "copied" ? (
                <CheckCircle2 size={16} aria-hidden="true" />
              ) : (
                <Clipboard size={16} aria-hidden="true" />
              )}
              {copyState === "copied" ? "已复制" : "复制 YAML"}
            </button>
          </div>
        </div>

        {isYamlVisible ? (
          <textarea
            readOnly
            value={state.generatedYaml}
            rows={16}
            className="mt-4 w-full resize-y rounded-md border border-story-gold/40 bg-story-bg px-3 py-3 font-mono text-xs leading-6 text-story-text outline-none"
            placeholder="生成剧本后，可以在这里查看结构化内容。"
          />
        ) : null}
      </section>
    </div>
  );
}

export default Studio;

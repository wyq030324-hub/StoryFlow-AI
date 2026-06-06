import {
  Activity,
  BadgeCheck,
  CheckCircle2,
  Clipboard,
  Database,
  Eraser,
  FileCode2,
  GitCompare,
  Loader2,
  PlayCircle,
  ScrollText,
  Sparkles,
  UsersRound,
  Wand2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { runAdaptationPlanner } from "../agents/adaptationPlanner.js";
import { runDirectorReviewer } from "../agents/directorReviewer.js";
import { runOriginalAnalyzer } from "../agents/originalAnalyzer.js";
import { runScreenplayWriter } from "../agents/screenplayWriter.js";
import {
  AGENT_FLOW,
  AGENT_KEYS,
  storyActionTypes,
  useStory,
} from "../context/StoryContext.jsx";
import { runRealWorkflow } from "../services/aiClient.js";
import { formatScreenplay } from "../utils/screenplayFormatter.js";
import { generateYaml } from "../utils/yamlFormatter.js";

const agentDelays = {
  [AGENT_KEYS.originalAnalyzer]: 400,
  [AGENT_KEYS.adaptationPlanner]: 400,
  [AGENT_KEYS.screenplayWriter]: 450,
  [AGENT_KEYS.directorReviewer]: 400,
  [AGENT_KEYS.yamlExporter]: 350,
};

const agentDisplayNames = {
  [AGENT_KEYS.originalAnalyzer]: "原著分析 Agent",
  [AGENT_KEYS.adaptationPlanner]: "改编规划 Agent",
  [AGENT_KEYS.screenplayWriter]: "剧本生成 Agent",
  [AGENT_KEYS.directorReviewer]: "导演审查 Agent",
  [AGENT_KEYS.yamlExporter]: "YAML 导出 Agent",
};

const runningMessages = {
  [AGENT_KEYS.originalAnalyzer]: "原著分析 Agent 正在拆解人物动机……",
  [AGENT_KEYS.adaptationPlanner]: "改编规划 Agent 正在重组剧情节奏……",
  [AGENT_KEYS.screenplayWriter]: "剧本生成 Agent 正在生成专业剧本……",
  [AGENT_KEYS.directorReviewer]: "导演审查 Agent 正在评估平台适配度……",
  [AGENT_KEYS.yamlExporter]: "YAML 导出 Agent 正在整理结构化结果……",
};

const statusLabel = {
  waiting: "等待中",
  running: "处理中",
  done: "已完成",
  error: "失败",
};

const statusClass = {
  waiting: "border-story-border text-story-muted",
  running:
    "animate-pulse border-story-gold bg-story-gold/10 text-story-gold shadow-[0_0_30px_rgba(201,169,110,0.16)]",
  done: "border-story-success bg-story-success/10 text-story-success",
  error: "border-red-400 bg-red-950/20 text-red-300",
};

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getDialogues(scene) {
  return scene?.dialogues || scene?.dialogue || [];
}

function formatEmotionalArc(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item.emotion || item.beat || "";
      })
      .filter(Boolean)
      .join(" → ");
  }

  return value || "等待生成";
}

function getIssues(reviewResult) {
  const issues = reviewResult?.issues || reviewResult?.riskFlags || [];

  return issues.map((issue) => {
    if (typeof issue === "string") {
      return {
        problem: issue,
        suggestion: "",
        severity: "",
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
  return (
    <div className="rounded-xl border border-story-border bg-story-bg/80 p-4">
      <p className="text-xs text-story-muted">运行模式</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          ["mock", "Demo Mode"],
          ["real", "Real AI Mode"],
        ].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mode)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              value === mode
                ? "border-story-gold bg-story-gold/10 text-story-gold"
                : "border-story-border text-story-muted hover:border-story-gold/60 hover:text-story-text"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Studio() {
  const { state, dispatch } = useStory();
  const [aiMode, setAiMode] = useState("mock");
  const [copyState, setCopyState] = useState("idle");
  const [scriptCopyState, setScriptCopyState] = useState("idle");
  const [isYamlVisible, setIsYamlVisible] = useState(false);
  const [pendingAgentKey, setPendingAgentKey] = useState(null);
  const screenplayRef = useRef(null);

  const isRunning = useMemo(
    () => Object.values(state.agentStatus).includes("running"),
    [state.agentStatus],
  );
  const canStart = Boolean(state.novelInput.content.trim()) && !isRunning;
  const scriptText = useMemo(
    () => formatScreenplay(state.screenplayDraft),
    [state.screenplayDraft],
  );
  const runningAgent =
    AGENT_FLOW.find((agentKey) => state.agentStatus[agentKey] === "running") || pendingAgentKey;
  const scenes = state.screenplayDraft?.scenes || state.scenes || [];
  const dialogueCount = scenes.reduce((total, scene) => total + getDialogues(scene).length, 0);
  const characterCount =
    state.analysisResult?.characters?.length ||
    new Set(scenes.flatMap((scene) => scene.characters || scene.characters_present || [])).size;
  const reviewScores = Object.values(state.reviewResult?.scores || {}).filter(
    (score) => typeof score === "number",
  );
  const adaptationScore = reviewScores.length
    ? Math.round(reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length)
    : "待评估";

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
  }

  function closeError() {
    dispatch({ type: storyActionTypes.RESET_WORKFLOW });
  }

  async function applyWorkflowResults(result) {
    dispatch({ type: storyActionTypes.SET_ANALYSIS_RESULT, payload: result.analysisResult });
    dispatch({ type: storyActionTypes.SET_AGENT_DONE, payload: AGENT_KEYS.originalAnalyzer });

    await delay(agentDelays[AGENT_KEYS.adaptationPlanner]);
    dispatch({ type: storyActionTypes.SET_AGENT_RUNNING, payload: AGENT_KEYS.adaptationPlanner });
    dispatch({ type: storyActionTypes.SET_ADAPTATION_PLAN, payload: result.adaptationPlan });
    dispatch({ type: storyActionTypes.SET_AGENT_DONE, payload: AGENT_KEYS.adaptationPlanner });

    await delay(agentDelays[AGENT_KEYS.screenplayWriter]);
    dispatch({ type: storyActionTypes.SET_AGENT_RUNNING, payload: AGENT_KEYS.screenplayWriter });
    dispatch({ type: storyActionTypes.SET_SCREENPLAY_DRAFT, payload: result.screenplayDraft });
    dispatch({ type: storyActionTypes.SET_AGENT_DONE, payload: AGENT_KEYS.screenplayWriter });

    await delay(agentDelays[AGENT_KEYS.directorReviewer]);
    dispatch({ type: storyActionTypes.SET_AGENT_RUNNING, payload: AGENT_KEYS.directorReviewer });
    dispatch({
      type: storyActionTypes.SET_REVIEW_RESULT,
      payload: {
        reviewResult: result.reviewResult,
        characterGraph: result.characterGraph || null,
        directorRoom: result.directorRoom || null,
      },
    });
    dispatch({ type: storyActionTypes.SET_AGENT_DONE, payload: AGENT_KEYS.directorReviewer });

    await delay(agentDelays[AGENT_KEYS.yamlExporter]);
    dispatch({ type: storyActionTypes.SET_AGENT_RUNNING, payload: AGENT_KEYS.yamlExporter });
    dispatch({
      type: storyActionTypes.SET_GENERATED_YAML,
      payload: generateYaml(result.screenplayDraft, result.reviewResult),
    });
    dispatch({ type: storyActionTypes.SET_AGENT_DONE, payload: AGENT_KEYS.yamlExporter });
  }

  async function runDemoWorkflow() {
    dispatch({ type: storyActionTypes.SET_AGENT_RUNNING, payload: AGENT_KEYS.originalAnalyzer });
    const analysisResult = await runOriginalAnalyzer(state.novelInput);
    const adaptationPlan = await runAdaptationPlanner(analysisResult);
    const screenplayDraft = await runScreenplayWriter(
      adaptationPlan,
      analysisResult,
      state.novelInput,
    );
    const reviewResult = await runDirectorReviewer(screenplayDraft, adaptationPlan);

    await applyWorkflowResults({
      analysisResult,
      adaptationPlan,
      screenplayDraft,
      reviewResult,
      characterGraph: state.characterGraph,
      directorRoom: state.directorRoom,
    });
  }

  async function runRealAiWorkflow() {
    dispatch({ type: storyActionTypes.SET_AGENT_RUNNING, payload: AGENT_KEYS.originalAnalyzer });
    setPendingAgentKey(AGENT_KEYS.originalAnalyzer);

    const agentSequence = [
      AGENT_KEYS.originalAnalyzer,
      AGENT_KEYS.adaptationPlanner,
      AGENT_KEYS.screenplayWriter,
      AGENT_KEYS.directorReviewer,
    ];

    let stepIndex = 0;
    const hintTimer = window.setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, agentSequence.length - 1);
      setPendingAgentKey(agentSequence[stepIndex]);
    }, 1800);

    try {
      const workflowResult = await runRealWorkflow(state.novelInput.content);
      window.clearInterval(hintTimer);
      setPendingAgentKey(null);
      await applyWorkflowResults(workflowResult);
    } catch (error) {
      window.clearInterval(hintTimer);
      setPendingAgentKey(null);
      throw error;
    }
  }

  async function startWorkflow() {
    if (!state.novelInput.content.trim()) {
      dispatch({
        type: storyActionTypes.SET_AGENT_ERROR,
        payload: {
          agent: AGENT_KEYS.originalAnalyzer,
          error: "请先输入小说内容，或点击加载示例小说。",
        },
      });
      return;
    }

    try {
      dispatch({ type: storyActionTypes.START_WORKFLOW });
      setCopyState("idle");
      setScriptCopyState("idle");
      setIsYamlVisible(false);

      if (aiMode === "real") {
        await runRealAiWorkflow();
      } else {
        await runDemoWorkflow();
      }
    } catch (error) {
      dispatch({
        type: storyActionTypes.SET_AGENT_ERROR,
        payload: {
          agent: runningAgent || AGENT_KEYS.originalAnalyzer,
          error:
            error.message ||
            "真实 AI 调用失败，请检查 API Key、网络连接或本地 server 是否已启动。",
        },
      });
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

  function scrollToScreenplay() {
    screenplayRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="space-y-8">
      {state.error ? (
        <section className="flex flex-col gap-3 rounded-lg border border-red-400 bg-red-950/20 px-4 py-3 text-sm text-red-300 md:flex-row md:items-center md:justify-between">
          <p>{state.error}</p>
          <div className="flex gap-2">
            {aiMode === "real" ? (
              <button
                type="button"
                onClick={() => setAiMode("mock")}
                className="rounded-md border border-red-400/50 px-3 py-1.5 transition hover:bg-red-400/10"
              >
                切回 Demo Mode
              </button>
            ) : null}
            <button
              type="button"
              onClick={closeError}
              className="rounded-md border border-red-400/50 p-1 transition hover:bg-red-400/10"
              aria-label="关闭错误提示"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
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
              输入小说后，系统将自动完成故事拆解、人物关系分析、剧本生成与导演审查。
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
                可以直接粘贴任意小说片段，也可以使用示例文本快速演示完整工作流。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadDemo}
                disabled={isRunning}
                className="inline-flex items-center gap-2 rounded-md border border-story-border bg-story-bg px-4 py-3 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Database size={16} aria-hidden="true" />
                使用示例文本
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
                开始 AI 改编
              </button>
            </div>
          </div>

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
            placeholder="粘贴小说片段，或点击使用示例文本"
          />
        </article>

        <ModeSwitch value={aiMode} onChange={setAiMode} disabled={isRunning} />
      </section>

      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-story-gold">Agent Pipeline</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">AI Agent 流水线</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <p className="text-sm text-story-muted">
              当前模式：{aiMode === "real" ? "Real AI Mode" : "Demo Mode"}
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

        <ol className="mt-5 grid gap-3 md:grid-cols-5">
          {AGENT_FLOW.map((agentKey, index) => {
            const status = state.agentStatus[agentKey] || "waiting";

            return (
              <li
                key={agentKey}
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
                <span className="text-xs text-story-muted">0{index + 1}</span>
                <p className="mt-2 font-medium">{agentDisplayNames[agentKey]}</p>
                <p className="mt-3 text-xs">{statusLabel[status] || status}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 rounded-lg border border-story-border bg-story-bg/70 p-4">
          <p className="text-sm text-story-muted">执行状态</p>
          <p className="mt-2 text-sm text-story-text">
            {runningAgent
              ? runningMessages[runningAgent]
              : state.generatedYaml
                ? "剧本改编已完成，可继续查看完整剧本、人物关系和导演审查报告。"
                : "请输入小说内容并启动工作流。"}
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
              使用专业影视剧本格式输出，方便导演和编剧直接阅读。
            </p>
          </div>
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
            {scriptCopyState === "copied" ? "已复制" : "复制完整剧本"}
          </button>
        </div>

        {!scriptText ? (
          <div className="mt-5 rounded-lg border border-story-border bg-story-bg/70 p-6 text-sm text-story-muted">
            请先加载示例小说或输入新小说，然后开始 AI 改编。
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg border border-story-gold/40 bg-story-bg">
            <div className="border-b border-story-border bg-story-card/80 px-4 py-4">
              <h3 className="font-serif text-2xl font-semibold">
                《{state.screenplayDraft?.screenplay?.title || state.novelInput.title || "未命名剧本"}》
              </h3>
              <div className="mt-3 grid gap-3 text-sm text-story-muted md:grid-cols-2">
                <p>
                  <span className="text-story-gold">主题：</span>
                  {state.screenplayDraft?.theme || state.analysisResult?.theme || "等待生成"}
                </p>
                <p>
                  <span className="text-story-gold">情感走向：</span>
                  {formatEmotionalArc(
                    state.screenplayDraft?.emotional_arc || state.analysisResult?.emotional_arc,
                  )}
                </p>
              </div>
            </div>
            <pre className="max-h-[760px] overflow-auto whitespace-pre-wrap px-4 py-5 font-mono text-sm leading-8 text-story-text">
              {scriptText}
            </pre>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-story-gold">Director Review</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">导演审查报告</h2>
          </div>
          {scriptText ? (
            <button
              type="button"
              onClick={scrollToScreenplay}
              className="rounded-md border border-story-gold/70 px-4 py-2 text-sm text-story-gold transition hover:bg-story-gold/10"
            >
              回到完整剧本
            </button>
          ) : null}
        </div>

        {!state.reviewResult ? (
          <div className="mt-5 rounded-lg border border-story-border bg-story-bg/70 p-6 text-sm text-story-muted">
            导演审查会在剧本生成后自动出现。
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {getScoreCards(state.reviewResult).map((card) => (
                <article
                  key={card.label}
                  className="rounded-lg border border-story-border bg-story-bg/80 p-4"
                >
                  <p className="text-sm text-story-muted">{card.label}</p>
                  <p className="mt-3 font-serif text-4xl text-story-gold">{card.value}</p>
                </article>
              ))}
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
          </>
        )}
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm text-story-gold">Overview</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold">数据统计卡片</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="人物数" value={characterCount} icon={UsersRound} />
          <StatCard label="场景数" value={scenes.length} icon={ScrollText} />
          <StatCard label="对白数" value={dialogueCount} icon={Clipboard} />
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
          ["/characters", UsersRound, "人物关系", "查看角色关系与叙事图谱"],
          ["/rewrite", Wand2, "创意重构", "尝试不同导演风格"],
          ["/comparison", GitCompare, "原著对照", "追踪原文与 Scene 对应"],
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
            <p className="text-sm text-story-muted">技术交付</p>
            <h2 className="font-serif text-2xl font-semibold">查看技术结构 / YAML 导出</h2>
            <p className="mt-1 text-sm text-story-muted">
              YAML 面向后续分镜、配音、短剧生成和多模型审查，默认折叠，不干扰剧本阅读。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsYamlVisible((visible) => !visible)}
              disabled={!state.generatedYaml}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border px-4 py-2 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileCode2 size={16} aria-hidden="true" />
              {isYamlVisible ? "收起 YAML" : "查看技术结构 / YAML 导出"}
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
            placeholder="流程完成后，YAML 将在这里生成。"
          />
        ) : null}
      </section>
    </div>
  );
}

export default Studio;

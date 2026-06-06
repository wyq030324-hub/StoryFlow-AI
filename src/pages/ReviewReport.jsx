import { Link } from "react-router-dom";
import { useStory } from "../context/StoryContext.jsx";
import { normalizeEmotionalArc } from "../utils/emotionalArc.js";

function renderEmotionalArc(analysisResult, screenplayDraft) {
  return normalizeEmotionalArc(
    analysisResult?.emotional_arc || screenplayDraft?.emotional_arc || [],
    "review.emotionalArc",
  );
}

function EmotionCurve({ emotionalArc }) {
  const safeArc = Array.isArray(emotionalArc) ? emotionalArc : [];
  const fallbackPoints = [28, 52, 76, 92];
  const points = (safeArc.length ? safeArc : ["起始", "推进", "冲突", "落点"]).map(
    (beat, index) => ({
      label: String(beat).slice(0, 8),
      value: fallbackPoints[index] || 92,
    }),
  );

  const path = points
    .map((point, index) => {
      const x = 24 + index * 92;
      const y = 110 - point.value;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-story-muted">情绪轨迹</p>
          <h2 className="mt-1 font-serif text-xl font-semibold">本章情绪变化曲线</h2>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-story-border bg-story-bg/80 p-4">
        <svg viewBox="0 0 320 140" className="h-44 w-full" aria-hidden="true">
          <path d="M 20 114 H 300" stroke="rgba(138,122,106,0.35)" strokeWidth="1" />
          <path
            d={path}
            fill="none"
            stroke="#c9a96e"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {points.map((point, index) => {
            const x = 24 + index * 92;
            const y = 110 - point.value;

            return (
              <g key={`${point.label}-${index}`}>
                <circle cx={x} cy={y} r="5" fill="#c9a96e" />
                <text x={x} y="132" fill="#8a7a6a" fontSize="10" textAnchor="middle">
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <ol className="mt-4 grid gap-3 md:grid-cols-4">
        {safeArc.length ? (
          safeArc.map((beat, index) => (
            <li
              key={`${beat}-${index}`}
              className="rounded-md border border-story-border bg-story-bg/70 px-3 py-3 text-sm leading-6 text-story-muted"
            >
              <span className="block text-story-gold">节拍 {index + 1}</span>
              {beat}
            </li>
          ))
        ) : (
          <li className="rounded-md border border-story-border bg-story-bg/70 px-3 py-3 text-sm text-story-muted md:col-span-4">
            暂无情绪轨迹数据
          </li>
        )}
      </ol>
    </article>
  );
}

function buildScoreDetails(reviewResult) {
  const details = reviewResult?.scoreDetails || {};
  const scores = reviewResult?.scores || {};
  const fallback = {
    fidelity_score: "原著忠实度",
    dramatic_conflict_score: "戏剧冲突",
    character_score: "人物一致性",
    filmability_score: "镜头可拍性",
    pacing_score: "节奏控制",
    emotion_score: "情感传达",
    commercial_score: "商业短剧潜力",
  };

  return Object.entries(fallback).map(([key, label]) => ({
    key,
    label: details[key]?.label || label,
    score: details[key]?.score || scores[key] || 0,
    reason: details[key]?.reason || "当前暂无详细判断理由。",
    issue: details[key]?.issue || "当前暂无明确问题。",
    suggestion: details[key]?.suggestion || "当前暂无修改建议。",
  }));
}

function normalizeIssue(issue, index) {
  if (typeof issue === "string") {
    return { key: `issue-${index}`, problem: issue, suggestion: "" };
  }

  return {
    key: `${issue?.scene_id || "issue"}-${index}`,
    problem: issue?.problem || issue?.type || "未命名问题",
    suggestion: issue?.suggestion || "",
  };
}

function ReviewReport() {
  const { state } = useStory();
  const reviewResult = state.reviewResult || null;
  const scenes = state.scenes || [];
  const analysisResult = state.analysisResult || null;
  const adaptationPlan = state.adaptationPlan || null;
  const generatedYaml = state.generatedYaml || "";
  const screenplayDraft = state.screenplayDraft || null;

  if (!reviewResult) {
    return (
      <section className="rounded-xl border border-story-border bg-story-card/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <p className="text-sm uppercase tracking-wide text-story-muted">AI 导演审查官</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold">导演审查报告</h1>
        <p className="mt-4 max-w-2xl text-story-muted">
          暂无导演审查结果，请先运行 AI 改编流程。
        </p>
        <Link
          to="/workspace"
          className="mt-6 inline-flex rounded-md bg-story-gold px-4 py-2 text-sm font-medium text-story-bg"
        >
          返回工作台
        </Link>
      </section>
    );
  }

  const scoreDetails = buildScoreDetails(reviewResult);
  const issues = (reviewResult?.issues || reviewResult?.riskFlags || []).map(normalizeIssue);
  const suggestions = reviewResult?.suggestions || reviewResult?.revisionSuggestions || [];
  const emotionalArc = renderEmotionalArc(analysisResult, screenplayDraft);
  const criteria = reviewResult?.reviewCriteria || [];
  const sceneReviews = reviewResult?.sceneReviews || [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-story-border bg-story-card/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <p className="text-sm uppercase tracking-wide text-story-muted">AI 导演审查官</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">导演审查报告</h1>
        <p className="mt-4 max-w-4xl leading-7 text-story-muted">
          本报告由 AI 导演审查官基于专业剧本评估标准生成，用于模拟导演、编剧、制片视角对改编剧本进行审查。
        </p>
        <p className="mt-4 max-w-4xl leading-7 text-story-muted">
          {reviewResult?.summary || "当前暂无总体审查摘要。"}
        </p>
      </section>

      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-story-gold">Review Criteria</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">专业审查标准</h2>
          </div>
          <span className="rounded-full border border-story-border px-3 py-1 text-xs text-story-muted">
            导演 / 编剧 / 制片视角
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {criteria.length ? (
            criteria.map((criterion, index) => (
              <p
                key={`${criterion}-${index}`}
                className="rounded-lg border border-story-border bg-story-bg/75 px-4 py-3 text-sm leading-7 text-story-muted"
              >
                {criterion}
              </p>
            ))
          ) : (
            <p className="rounded-lg border border-story-border bg-story-bg/75 px-4 py-3 text-sm text-story-muted xl:col-span-3">
              暂无审查标准明细
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {scoreDetails.map((detail) => (
          <article
            key={detail.key}
            className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-story-muted">{detail.label}</p>
                <p className="mt-2 font-serif text-4xl font-semibold text-story-gold">
                  {detail.score}
                </p>
              </div>
              <span className="rounded-md border border-story-border px-2 py-1 text-xs text-story-muted">
                /100
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-story-bg">
              <div
                className="h-full rounded-full bg-story-gold"
                style={{ width: `${Math.min(Math.max(detail.score, 0), 100)}%` }}
              />
            </div>
            <dl className="mt-5 space-y-4 text-sm leading-7">
              <div>
                <dt className="text-story-gold">判断理由</dt>
                <dd className="mt-1 text-story-muted">{detail.reason}</dd>
              </div>
              <div>
                <dt className="text-story-gold">存在问题</dt>
                <dd className="mt-1 text-story-muted">{detail.issue}</dd>
              </div>
              <div>
                <dt className="text-story-gold">修改建议</dt>
                <dd className="mt-1 text-story-muted">{detail.suggestion}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <EmotionCurve emotionalArc={emotionalArc} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">问题清单</h2>
          <ul className="mt-4 space-y-3">
            {issues.length ? (
              issues.map((issue) => (
                <li
                  key={issue.key}
                  className="rounded-md border border-story-border bg-story-bg/80 px-4 py-3 text-sm leading-6 text-story-muted"
                >
                  <p className="text-story-text">{issue.problem}</p>
                  {issue.suggestion ? <p className="mt-2 text-story-gold">{issue.suggestion}</p> : null}
                </li>
              ))
            ) : (
              <li className="rounded-md border border-story-border bg-story-bg/80 px-4 py-3 text-sm text-story-muted">
                暂无问题清单
              </li>
            )}
          </ul>
        </article>

        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">本章信号</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-story-muted">本章主题</dt>
              <dd className="mt-1 text-story-text">
                {analysisResult?.theme || screenplayDraft?.theme || "暂无主题"}
              </dd>
            </div>
            <div>
              <dt className="text-story-muted">目标形态</dt>
              <dd className="mt-1 text-story-text">
                {adaptationPlan?.target_format || "暂无目标形态"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-story-muted">场景数量</dt>
              <dd className="text-story-text">{scenes.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-story-muted">YAML 是否生成</dt>
              <dd className="text-story-text">{generatedYaml ? "已生成" : "未生成"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">整体修改建议</h2>
          <ol className="mt-4 space-y-3">
            {suggestions.length ? (
              suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion}-${index}`}
                  className="rounded-md bg-story-bg/80 px-4 py-3 text-sm leading-6 text-story-muted"
                >
                  <span className="mr-2 text-story-gold">{index + 1}.</span>
                  {suggestion}
                </li>
              ))
            ) : (
              <li className="rounded-md bg-story-bg/80 px-4 py-3 text-sm text-story-muted">
                暂无整体修改建议
              </li>
            )}
          </ol>
        </article>

        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">逐场审查摘录</h2>
          <ol className="mt-4 space-y-3">
            {sceneReviews.length ? (
              sceneReviews.map((review, index) => (
                <li
                  key={`${review?.sceneId || "scene-review"}-${index}`}
                  className="rounded-md border border-story-border px-4 py-3 text-sm leading-6 text-story-muted"
                >
                  <span className="mr-2 text-story-gold">{review?.sceneId || "未标注场次"}</span>
                  {review?.note || "暂无场次说明"}
                </li>
              ))
            ) : (
              <li className="rounded-md border border-story-border px-4 py-3 text-sm text-story-muted">
                暂无逐场审查摘录
              </li>
            )}
          </ol>
        </article>
      </section>
    </div>
  );
}

export default ReviewReport;

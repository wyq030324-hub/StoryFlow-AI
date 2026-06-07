import {
  AlertTriangle,
  GitBranch,
  HeartHandshake,
  Network,
  RotateCcw,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStory } from "../context/StoryContext.jsx";
import { characterGraph as fallbackCharacterGraph } from "../data/characterGraph.js";
import useRevealGroup from "../hooks/useRevealGroup.js";
import useRevealOnScroll from "../hooks/useRevealOnScroll.js";

const edgeTypeMeta = {
  emotion: {
    label: "情感线",
    color: "#d9a477",
    glow: "rgba(217, 164, 119, 0.42)",
    icon: HeartHandshake,
  },
  conflict: {
    label: "冲突线",
    color: "#b95f5f",
    glow: "rgba(185, 95, 95, 0.46)",
    icon: AlertTriangle,
  },
  mentor: {
    label: "师徒线",
    color: "#d8c28a",
    glow: "rgba(216, 194, 138, 0.34)",
    icon: Target,
  },
  memory: {
    label: "记忆线",
    color: "#c9bfa8",
    glow: "rgba(201, 191, 168, 0.3)",
    icon: Sparkles,
  },
};

const nodeToneMap = {
  主角: {
    bg: "rgba(201, 169, 110, 0.22)",
    border: "rgba(201, 169, 110, 0.82)",
    glow: "rgba(201, 169, 110, 0.5)",
  },
  情感线角色: {
    bg: "rgba(217, 164, 119, 0.16)",
    border: "rgba(217, 164, 119, 0.58)",
    glow: "rgba(217, 164, 119, 0.32)",
  },
  导师型角色: {
    bg: "rgba(216, 194, 138, 0.14)",
    border: "rgba(216, 194, 138, 0.52)",
    glow: "rgba(216, 194, 138, 0.26)",
  },
  对立角色: {
    bg: "rgba(185, 95, 95, 0.18)",
    border: "rgba(185, 95, 95, 0.64)",
    glow: "rgba(185, 95, 95, 0.38)",
  },
  记忆源点: {
    bg: "rgba(201, 191, 168, 0.12)",
    border: "rgba(201, 191, 168, 0.44)",
    glow: "rgba(201, 191, 168, 0.22)",
  },
};

const filterOptions = [
  {
    id: "focus",
    label: "聚焦主角",
    icon: Target,
  },
  {
    id: "all",
    label: "显示全部关系",
    icon: Network,
  },
  {
    id: "conflict",
    label: "只看冲突线",
    icon: AlertTriangle,
  },
  {
    id: "emotion",
    label: "只看情感线",
    icon: HeartHandshake,
  },
];

function findNode(graphData, id) {
  return graphData.nodes.find((node) => node.id === id);
}

function edgeIncludesNode(edge, nodeId) {
  return edge.source === nodeId || edge.target === nodeId;
}

function getOtherNode(graphData, edge, nodeId) {
  return findNode(graphData, edge.source === nodeId ? edge.target : edge.source);
}

function isNodeConnectedTo(graphData, nodeId, targetId) {
  return graphData.edges.some(
    (edge) => edgeIncludesNode(edge, nodeId) && edgeIncludesNode(edge, targetId),
  );
}

function getVisibleEdges(graphData, filterMode, activeNodeId) {
  if (filterMode === "focus") {
    return graphData.edges.filter((edge) => edgeIncludesNode(edge, activeNodeId));
  }

  if (filterMode === "conflict") {
    return graphData.edges.filter((edge) => edge.type === "conflict");
  }

  if (filterMode === "emotion") {
    return graphData.edges.filter((edge) => edge.type === "emotion");
  }

  return graphData.edges;
}

function getNodeMetrics(graphData, nodeId) {
  const relatedEdges = graphData.edges.filter((edge) => edgeIncludesNode(edge, nodeId));
  const averageStrength = Math.round(
    relatedEdges.reduce((sum, edge) => sum + edge.strength, 0) / Math.max(relatedEdges.length, 1),
  );
  const maxTension = Math.max(...relatedEdges.map((edge) => edge.tension), 0);
  const node = findNode(graphData, nodeId);

  return {
    plotPower: node?.importance || 0,
    emotionalPower: averageStrength,
    conflictTension: maxTension,
  };
}

function getNodeStyle(graphData, node, hoveredNodeId, visibleEdges) {
  const { x, y, z } = node.position3d;
  const relatedToHover =
    !hoveredNodeId ||
    node.id === hoveredNodeId ||
    isNodeConnectedTo(graphData, node.id, hoveredNodeId);
  const visibleInFilter = visibleEdges.some((edge) => edgeIncludesNode(edge, node.id));
  const depthScale = 0.78 + z / 160;
  const depthOpacity = Math.min(1, 0.58 + z / 110);
  const blur = Math.max(0, (26 - z) / 26);
  const tone = nodeToneMap[node.role] || nodeToneMap["主角"];

  return {
    "--planet-x": `${x}%`,
    "--planet-y": `${y}%`,
    "--planet-z": `${z}px`,
    "--node-scale": depthScale.toFixed(2),
    "--node-blur": `${blur.toFixed(2)}px`,
    "--node-opacity": relatedToHover && visibleInFilter ? depthOpacity.toFixed(2) : "0.32",
    "--node-z-index": Math.round(z + 20),
    "--node-bg": tone.bg,
    "--node-border": tone.border,
    "--node-glow": tone.glow,
  };
}

function MetricBar({ label, value, tone = "gold" }) {
  const fillClass =
    tone === "red"
      ? "bg-[#b95f5f]"
      : tone === "green"
        ? "bg-story-success"
        : "bg-story-gold";

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-story-muted">
        <span>{label}</span>
        <span className="font-serif text-base text-story-text">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-story-bg">
        <div
          className={`h-full rounded-full ${fillClass} shadow-[0_0_18px_rgba(201,169,110,0.18)]`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Characters() {
  const { state } = useStory();
  const graphData = state.characterGraph || fallbackCharacterGraph;
  const [activeNodeId, setActiveNodeId] = useState(graphData.nodes[0]?.id || "lin-zhao");
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const graphRef = useRef(null);
  const tiltEnabledRef = useRef(false);
  const nodeGroupRef = useRevealGroup(100);
  const mobileNodeGroupRef = useRevealGroup(70);
  const profileRef = useRevealOnScroll();
  const reportRef = useRevealOnScroll();

  const activeNode = findNode(graphData, activeNodeId) || graphData.nodes[0];
  const visibleEdges = useMemo(
    () => getVisibleEdges(graphData, filterMode, activeNodeId),
    [graphData, filterMode, activeNodeId],
  );
  const activeEdges = useMemo(
    () => graphData.edges.filter((edge) => edgeIncludesNode(edge, activeNodeId)),
    [graphData, activeNodeId],
  );
  const metrics = useMemo(() => getNodeMetrics(graphData, activeNodeId), [graphData, activeNodeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      tiltEnabledRef.current = true;
    }, 650);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!graphData.nodes.some((node) => node.id === activeNodeId)) {
      setActiveNodeId(graphData.nodes[0]?.id || "lin-zhao");
    }
  }, [graphData, activeNodeId]);

  function handleGraphMove(event) {
    if (!tiltEnabledRef.current || window.innerWidth < 768) {
      return;
    }

    const element = graphRef.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const rx = ((0.5 - offsetY / rect.height) * 8).toFixed(2);
    const ry = ((offsetX / rect.width - 0.5) * 8).toFixed(2);

    element.style.setProperty("--rx", `${rx}deg`);
    element.style.setProperty("--ry", `${ry}deg`);
  }

  function resetGraphTilt() {
    const element = graphRef.current;

    if (!element) {
      return;
    }

    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
    setHoveredNodeId(null);
  }

  function handleFilterClick(optionId) {
    if (optionId === "focus") {
      setActiveNodeId("lin-zhao");
      setFilterMode("focus");
      return;
    }

    setFilterMode(optionId);
  }

  function isEdgeHighlighted(edge) {
    if (hoveredNodeId) {
      return edgeIncludesNode(edge, hoveredNodeId);
    }

    return edgeIncludesNode(edge, activeNodeId);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-story-border bg-story-bg px-3 py-1 text-xs text-story-muted">
              <GitBranch size={14} className="text-story-gold" aria-hidden="true" />
              Narrative Graph Engine
            </div>
            <h1 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
              叙事图谱引擎
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-story-muted">
              从人物节点、叙事关系、情感强度与冲突张力四个维度，帮助导演判断谁是叙事中心、谁推动剧情、哪条关系最值得被改编强化。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const active = filterMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleFilterClick(option.id)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                    active
                      ? "border-story-gold bg-story-gold/10 text-story-text shadow-[0_0_18px_rgba(201,169,110,0.16)]"
                      : "border-story-border bg-story-bg/80 text-story-muted hover:border-story-gold/60 hover:text-story-text"
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 space-y-4">
          <div
            ref={graphRef}
            onMouseMove={handleGraphMove}
            onMouseLeave={resetGraphTilt}
            className="galaxy-stage narrative-graph-stage relative hidden min-h-[660px] overflow-hidden rounded-xl border border-story-border bg-story-card/95 shadow-[0_24px_90px_rgba(0,0,0,0.28)] md:block"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(201,169,110,0.16),transparent_24rem)]" />
            <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle,rgba(201,169,110,0.2)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="absolute left-6 top-6 rounded-full border border-story-border bg-story-bg/80 px-3 py-1 text-xs text-story-muted">
              强度越高线越粗，张力越高线越亮
            </div>

            <div ref={nodeGroupRef} className="galaxy-system narrative-graph-system absolute inset-0">
              <svg className="galaxy-lines absolute inset-0 h-full w-full" aria-hidden="true">
                {visibleEdges.map((edge) => {
                  const source = findNode(graphData, edge.source);
                  const target = findNode(graphData, edge.target);
                  const meta = edgeTypeMeta[edge.type] || edgeTypeMeta.emotion;
                  const highlighted = isEdgeHighlighted(edge);

                  return (
                    <line
                      key={`${edge.source}-${edge.target}`}
                      className={
                        highlighted
                          ? "orbit-glow-line orbit-glow-line-strong"
                          : "orbit-glow-line"
                      }
                      x1={`${source.position3d.x}%`}
                      y1={`${source.position3d.y}%`}
                      x2={`${target.position3d.x}%`}
                      y2={`${target.position3d.y}%`}
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeDasharray={edge.type === "conflict" ? "9 5" : undefined}
                      strokeOpacity={highlighted ? 0.88 : 0.24 + edge.tension / 420}
                      strokeWidth={highlighted ? Math.max(2.4, edge.strength / 17) : Math.max(1.2, edge.strength / 34)}
                      style={{
                        color: meta.color,
                        filter: highlighted
                          ? `drop-shadow(0 0 14px ${meta.glow})`
                          : `drop-shadow(0 0 5px ${meta.glow})`,
                      }}
                    />
                  );
                })}
              </svg>

              {visibleEdges.map((edge) => {
                const source = findNode(graphData, edge.source);
                const target = findNode(graphData, edge.target);
                const highlighted = isEdgeHighlighted(edge);

                if (!highlighted) {
                  return null;
                }

                return (
                  <span
                    key={`${edge.source}-${edge.target}-label`}
                    className="narrative-edge-label absolute rounded-full border border-story-gold/40 bg-story-bg/90 px-3 py-1 text-xs text-story-gold shadow-[0_0_20px_rgba(201,169,110,0.18)]"
                    style={{
                      left: `${(source.position3d.x + target.position3d.x) / 2}%`,
                      top: `${(source.position3d.y + target.position3d.y) / 2}%`,
                    }}
                  >
                    {edge.label}
                    <span className="ml-2 text-story-muted">
                      S{edge.strength} / T{edge.tension}
                    </span>
                  </span>
                );
              })}

              {graphData.nodes.map((node, index) => {
                const isActive = node.id === activeNodeId;
                const isRelatedToActive = isNodeConnectedTo(graphData, node.id, activeNodeId);

                return (
                  <span
                    key={node.id}
                    className="planet-anchor reveal-child absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={getNodeStyle(graphData, node, hoveredNodeId, visibleEdges)}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveNodeId(node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onFocus={() => setHoveredNodeId(node.id)}
                      onBlur={() => setHoveredNodeId(null)}
                      className={`narrative-node relative grid place-items-center rounded-full border text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isActive ? "narrative-node-active h-28 w-28" : isRelatedToActive ? "h-20 w-20" : "h-16 w-16"
                      }`}
                      style={{ animationDelay: `${index * -1.15}s` }}
                      aria-label={`查看${node.name}的导演分析`}
                    >
                      {isActive ? (
                        <span className="narrative-node-orbit" aria-hidden="true" />
                      ) : null}
                      <span className="px-2">
                        <span className="block font-serif text-lg text-story-text">
                          {node.name}
                        </span>
                        {isActive || isRelatedToActive ? (
                          <span className="mt-1 block text-[11px] text-story-muted">
                            {isActive ? "叙事中心" : edgeTypeMeta[activeEdges.find((edge) => edgeIncludesNode(edge, node.id))?.type]?.label || "相关人物"}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            <div ref={mobileNodeGroupRef} className="grid gap-3">
              {graphData.nodes.map((node) => {
                const isActive = node.id === activeNodeId;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveNodeId(node.id)}
                    className={`reveal-child rounded-xl border p-4 text-left transition ${
                      isActive
                        ? "border-story-gold bg-story-gold/10 shadow-[0_0_20px_rgba(201,169,110,0.16)]"
                        : "border-story-border bg-story-card/95"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-serif text-xl text-story-text">{node.name}</p>
                        <p className="mt-1 text-xs text-story-muted">{node.role} / {node.archetype}</p>
                      </div>
                      <span className="font-serif text-2xl text-story-gold">
                        {node.importance}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-story-muted">
                      {node.narrativeFunction}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-story-border bg-story-card/95 p-4">
              <p className="mb-3 text-sm text-story-muted">简化关系图</p>
              <div className="grid gap-3">
                {visibleEdges.map((edge) => {
                  const source = findNode(graphData, edge.source);
                  const target = findNode(graphData, edge.target);
                  const meta = edgeTypeMeta[edge.type] || edgeTypeMeta.emotion;

                  return (
                    <div
                      key={`${edge.source}-${edge.target}-mobile`}
                      className="rounded-lg border border-story-border bg-story-bg/80 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-story-text">{source.name} ↔ {target.name}</span>
                        <span style={{ color: meta.color }}>{edge.label}</span>
                      </div>
                      <p className="mt-2 text-xs text-story-muted">
                        强度 {edge.strength} / 张力 {edge.tension}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside
          ref={profileRef}
          className="reveal-item rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
        >
          <div key={activeNode.id} className="animate-reveal-up">
            <div className="flex items-center gap-3">
              <span className="rounded-md border border-story-gold/50 bg-story-bg p-2 text-story-gold">
                <UsersRound size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-story-muted">导演分析面板</p>
                <h2 className="font-serif text-2xl font-semibold">{activeNode.name}</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <MetricBar label="剧情推动力" value={metrics.plotPower} />
              <MetricBar label="情感强度" value={metrics.emotionalPower} tone="green" />
              <MetricBar label="冲突张力" value={metrics.conflictTension} tone="red" />
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-story-muted">人物身份</dt>
                <dd className="mt-1 text-story-text">{activeNode.role}</dd>
              </div>
              <div>
                <dt className="text-story-muted">角色原型</dt>
                <dd className="mt-1 text-story-text">{activeNode.archetype}</dd>
              </div>
              <div>
                <dt className="text-story-muted">当前情绪</dt>
                <dd className="mt-1 leading-6 text-story-text">{activeNode.emotionalState}</dd>
              </div>
              <div>
                <dt className="text-story-muted">人物弧光</dt>
                <dd className="mt-1 leading-6 text-story-text">{activeNode.arc}</dd>
              </div>
              <div>
                <dt className="text-story-muted">叙事作用</dt>
                <dd className="mt-1 leading-6 text-story-text">
                  {activeNode.narrativeFunction}
                </dd>
              </div>
              <div>
                <dt className="text-story-muted">导演提示</dt>
                <dd className="mt-1 leading-6 text-story-text">{activeNode.directorNote}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-sm text-story-muted">出场场次</p>
              <div className="mt-3 grid gap-2">
                {activeNode.scenes.map((scene) => (
                  <span
                    key={scene}
                    className="rounded-md border border-story-border bg-story-bg/80 px-3 py-2 text-sm text-story-text"
                  >
                    {scene}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-story-muted">关键关系</p>
              <ul className="mt-3 space-y-3">
                {activeEdges.map((edge) => {
                  const otherNode = getOtherNode(graphData, edge, activeNodeId);
                  const meta = edgeTypeMeta[edge.type] || edgeTypeMeta.emotion;
                  const Icon = meta.icon;

                  return (
                    <li
                      key={`${edge.source}-${edge.target}`}
                      className="rounded-md border border-story-border bg-story-bg/80 px-3 py-3 text-sm leading-6 text-story-muted"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-2 text-story-text">
                          <Icon size={14} style={{ color: meta.color }} aria-hidden="true" />
                          {otherNode?.name} / {edge.label}
                        </p>
                        <span className="text-xs text-story-gold">
                          S{edge.strength} · T{edge.tension}
                        </span>
                      </div>
                      <p className="mt-2">{edge.directorMeaning}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>
      </section>

      <section
        ref={reportRef}
        className="reveal-item rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.22)] md:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="rounded-md border border-story-gold/50 bg-story-bg p-2 text-story-gold">
            <RotateCcw size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-story-muted">AI 结构化分析</p>
            <h2 className="font-serif text-2xl font-semibold">叙事图谱报告</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["叙事中心", graphData.report.narrativeCenter],
            ["最强情感线", graphData.report.strongestEmotionLine],
            ["最高冲突线", graphData.report.highestConflictLine],
            ["最值得强化的改编点", graphData.report.adaptationFocus],
            ["导演建议", graphData.report.directorSuggestion],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-story-border bg-story-bg/80 p-4"
            >
              <p className="text-xs text-story-muted">{label}</p>
              <p className="mt-3 text-sm leading-6 text-story-text">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Characters;



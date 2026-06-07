import { CheckCircle2, Clipboard, Download, Edit3, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { storyActionTypes, useStory } from "../context/StoryContext.jsx";
import { demoNovel } from "../data/demoNovel.js";
import {
  downloadTextFile,
  formatParagraphNumber,
  formatScreenplay,
  splitScreenplayIntoSections,
} from "../utils/screenplayFormatter.js";
import { generateYaml } from "../utils/yamlFormatter.js";

function getSceneId(scene, index) {
  return scene?.scene_id || scene?.id || `pair-${index + 1}`;
}

function sceneToScript(scene, index) {
  if (!scene) {
    return "";
  }

  return formatScreenplay({
    scenes: [
      {
        ...scene,
        scene_number: scene.scene_number || index + 1,
      },
    ],
  });
}

function groupParagraphsForComparison(paragraphs, targetCount) {
  const cleanParagraphs = (paragraphs || []).filter(Boolean);
  const count = Math.max(targetCount, 1);
  const groupSize = Math.ceil(cleanParagraphs.length / count);

  return Array.from({ length: count }, (_, index) =>
    cleanParagraphs.slice(index * groupSize, (index + 1) * groupSize).join("\n\n"),
  ).filter(Boolean);
}

function buildPairs(paragraphs, screenplayDraft, scenes) {
  const fullScript = formatScreenplay(screenplayDraft);
  const scriptSections = scenes.length
    ? scenes.map(sceneToScript)
    : splitScreenplayIntoSections(fullScript);
  const targetCount = scriptSections.length || scenes.length || 1;
  const groupedParagraphs = groupParagraphsForComparison(paragraphs, targetCount);
  const pairCount = Math.max(groupedParagraphs.length, scriptSections.length, 1);

  return Array.from({ length: pairCount }, (_, index) => ({
    id: getSceneId(scenes[index], index),
    paragraph: groupedParagraphs[index] || "暂无原著内容",
    script: scriptSections[index] || "暂无改编剧本",
    scene: scenes[index] || null,
  }));
}

function Comparison() {
  const { state, dispatch } = useStory();
  const paragraphs = state.novelInput.paragraphs?.length
    ? state.novelInput.paragraphs
    : demoNovel.paragraphs;
  const scenes = state.scenes?.length ? state.scenes : state.screenplayDraft?.scenes || [];
  const pairs = useMemo(
    () => buildPairs(paragraphs, state.screenplayDraft, scenes),
    [paragraphs, scenes, state.screenplayDraft],
  );
  const hasWorkflowResult = Boolean(state.screenplayDraft);
  const [editedScripts, setEditedScripts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [copyState, setCopyState] = useState("idle");
  const activeSceneId = state.activeSceneId || pairs[0]?.id;

  useEffect(() => {
    setEditedScripts((current) => {
      const next = {};
      pairs.forEach((pair) => {
        next[pair.id] = current[pair.id] || pair.script;
      });
      return next;
    });
  }, [pairs]);

  function setActiveScene(sceneId) {
    if (!sceneId) {
      return;
    }

    dispatch({
      type: storyActionTypes.SET_ACTIVE_SCENE,
      payload: sceneId,
    });
  }

  async function copyScript(text) {
    if (!text) {
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  function exportCurrent(format, content) {
    if (format === "md") {
      downloadTextFile("storyflow-screenplay.md", `# StoryFlow 改编剧本\n\n${content}`);
      return;
    }

    downloadTextFile("storyflow-screenplay.txt", content);
  }

  function exportYaml(content) {
    const yaml = generateYaml(
      {
        screenplay: {
          title: state.novelInput.title || "StoryFlow 改编剧本",
          format: "structured_screenplay",
        },
        screenplayText: content,
        scenes: [],
      },
      null,
      {
        title: state.novelInput.title || "StoryFlow 改编剧本",
        novelInput: state.novelInput,
      },
    );

    downloadTextFile("storyflow-screenplay.yaml", yaml);
  }

  if (!hasWorkflowResult) {
    return (
      <section className="rounded-xl border border-story-border bg-story-card/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <p className="text-sm uppercase tracking-wide text-story-muted">原著对照</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold">等待生成改编剧本</h1>
        <p className="mt-4 max-w-2xl text-story-muted">
          请先回到工作台输入小说并生成剧本，再查看原著内容与改编剧本的对应关系。
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

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-story-border bg-story-card/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <p className="text-sm uppercase tracking-wide text-story-muted">原著对照</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">原著内容 ↔ 改编剧本</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-story-muted">
          左侧保留原著的章节或自然段语境，右侧展示对应的一整段改编剧本。你可以直接编辑改编文本，并导出 TXT、Markdown 或结构化 YAML。
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-story-muted">对照编辑</p>
            <h2 className="mt-1 font-serif text-xl font-semibold">原著内容 ↔ 改编剧本</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-story-muted">
            <span className="rounded-full border border-story-border px-3 py-1">{pairs.length} 组对照</span>
            <span className="rounded-full border border-story-border px-3 py-1">{scenes.length || pairs.length} 段剧本</span>
            <span className="rounded-full border border-story-gold/60 px-3 py-1 text-story-gold">
              当前：{formatParagraphNumber(pairs.findIndex((pair) => pair.id === activeSceneId) + 1 || 1)}
            </span>
          </div>
        </div>

        {pairs.map((pair, index) => {
          const scriptValue = editedScripts[pair.id] || pair.script;
          const isActive = pair.id === activeSceneId;
          const isEditing = editingId === pair.id;

          return (
            <article
              key={pair.id}
              className={`min-w-0 overflow-hidden rounded-xl border p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] transition ${
                isActive
                  ? "border-story-gold bg-story-gold/10 shadow-[0_0_20px_rgba(201,169,110,0.15)]"
                  : "border-story-border bg-story-card/95"
              }`}
              onClick={() => setActiveScene(pair.id)}
            >
              <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)]">
                <div className="min-w-0 overflow-hidden rounded-lg border border-story-border bg-story-bg/80 p-4">
                  <span className="text-xs uppercase tracking-wide text-story-muted">
                    {formatParagraphNumber(index + 1)}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-semibold text-story-text">原著内容</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-story-text">
                    {pair.paragraph}
                  </p>
                </div>

                <div className="min-w-0 overflow-hidden rounded-lg border border-story-border bg-story-bg/80 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-story-muted">
                        {pair.scene
                          ? `第${pair.scene.scene_number || index + 1}场`
                          : formatParagraphNumber(index + 1)}
                      </span>
                      <h3 className="mt-2 font-serif text-xl font-semibold text-story-text">
                        改编剧本
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingId(null);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-story-gold/60 px-3 py-2 text-xs text-story-gold transition hover:bg-story-gold/10"
                        >
                          <Save size={14} aria-hidden="true" />
                          保存
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingId(pair.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-story-border px-3 py-2 text-xs text-story-muted transition hover:border-story-gold hover:text-story-gold"
                        >
                          <Edit3 size={14} aria-hidden="true" />
                          编辑
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          copyScript(scriptValue);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-story-border px-3 py-2 text-xs text-story-muted transition hover:border-story-gold hover:text-story-gold"
                      >
                        {copyState === "copied" ? <CheckCircle2 size={14} /> : <Clipboard size={14} />}
                        {copyState === "copied" ? "已复制" : "复制剧本"}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          exportCurrent("txt", scriptValue);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-story-border px-3 py-2 text-xs text-story-muted transition hover:border-story-gold hover:text-story-gold"
                      >
                        <Download size={14} aria-hidden="true" />
                        导出 TXT
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          exportCurrent("md", scriptValue);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-story-border px-3 py-2 text-xs text-story-muted transition hover:border-story-gold hover:text-story-gold"
                      >
                        <Download size={14} aria-hidden="true" />
                        导出 Markdown
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          exportYaml(scriptValue);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-story-border px-3 py-2 text-xs text-story-muted transition hover:border-story-gold hover:text-story-gold"
                      >
                        <Download size={14} aria-hidden="true" />
                        导出 YAML
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={scriptValue}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        setEditedScripts((current) => ({
                          ...current,
                          [pair.id]: event.target.value,
                        }))
                      }
                      rows={14}
                      className="mt-4 w-full resize-y rounded-md border border-story-gold/40 bg-story-card px-3 py-3 font-mono text-sm leading-7 text-story-text outline-none focus:border-story-gold"
                    />
                  ) : (
                    <pre className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-story-border bg-story-card/70 px-3 py-3 font-mono text-sm leading-7 text-story-text">
                      {scriptValue}
                    </pre>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default Comparison;

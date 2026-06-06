import { Link } from "react-router-dom";
import { storyActionTypes, useStory } from "../context/StoryContext.jsx";
import { demoNovel } from "../data/demoNovel.js";

function getSceneId(scene) {
  return scene?.scene_id || scene?.id || "";
}

function getHeading(scene) {
  return (
    scene?.heading || {
      int_ext: scene?.int_ext || "INT.",
      location: scene?.location || "未标注地点",
      time: scene?.time || scene?.timeOfDay || "未标注时间",
      atmosphere: scene?.summary || "未标注氛围",
    }
  );
}

function getActionLines(scene) {
  return Array.isArray(scene?.action_lines) ? scene.action_lines : scene?.action ? [scene.action] : [];
}

function getDialogues(scene) {
  return Array.isArray(scene?.dialogues) ? scene.dialogues : scene?.dialogue || [];
}

function Comparison() {
  const { state, dispatch } = useStory();
  const paragraphs = state.novelInput.paragraphs?.length ? state.novelInput.paragraphs : demoNovel.paragraphs;
  const scenes = state.scenes?.length ? state.scenes : state.screenplayDraft?.scenes || [];
  const hasWorkflowResult = scenes.length > 0;
  const activeSceneId = state.activeSceneId || getSceneId(scenes[0]);

  function setActiveScene(sceneId) {
    if (!sceneId) {
      return;
    }

    dispatch({
      type: storyActionTypes.SET_ACTIVE_SCENE,
      payload: sceneId,
    });
  }

  if (!hasWorkflowResult) {
    return (
      <section className="rounded-xl border border-story-border bg-story-card/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <p className="text-sm uppercase tracking-wide text-story-muted">原著对照</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold">等待生成剧本场景</h1>
        <p className="mt-4 max-w-2xl text-story-muted">
          请先回到工作台，点击“加载示例小说”，再运行“开始 AI 改编”。
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
        <h1 className="mt-2 font-serif text-3xl font-semibold">原著段落 × 剧本场景</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-story-muted">
          左侧保留小说原文的阅读节奏，右侧展示改编后的场景。点击任一段落或场景即可高亮对应结果。
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-story-muted">一一对应结构</p>
            <h2 className="mt-1 font-serif text-xl font-semibold">原著段落 → 对应 Scene</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-story-muted">
            <span className="rounded-full border border-story-border px-3 py-1">{paragraphs.length} 段原文</span>
            <span className="rounded-full border border-story-border px-3 py-1">{scenes.length} 个 Scene</span>
            <span className="rounded-full border border-story-gold/60 px-3 py-1 text-story-gold">
              当前：{activeSceneId || "暂无场景"}
            </span>
          </div>
        </div>

        {paragraphs.map((paragraph, index) => {
          const scene = scenes[index] || null;
          const sceneId = getSceneId(scene);
          const heading = getHeading(scene);
          const actionLines = getActionLines(scene);
          const dialogues = getDialogues(scene);
          const isActive = sceneId && sceneId === activeSceneId;

          return (
            <article
              key={`${index}-${sceneId || "empty"}`}
              className={`min-w-0 overflow-hidden rounded-xl border p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] transition ${
                isActive
                  ? "border-story-gold bg-story-gold/10 shadow-[0_0_20px_rgba(201,169,110,0.15)]"
                  : "border-story-border bg-story-card/95"
              }`}
            >
              <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
                <button
                  type="button"
                  onClick={() => setActiveScene(sceneId)}
                  disabled={!sceneId}
                  className="min-w-0 overflow-hidden rounded-lg border border-story-border bg-story-bg/80 p-4 text-left transition hover:border-story-gold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-xs uppercase tracking-wide text-story-muted">原文段落 {index + 1}</span>
                  <p className="mt-3 text-sm leading-7 text-story-text">{paragraph}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveScene(sceneId)}
                  disabled={!sceneId}
                  className="min-w-0 overflow-hidden rounded-lg border border-story-border bg-story-bg/80 p-4 text-left transition hover:border-story-gold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {scene ? (
                    <>
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <span className="text-xs uppercase tracking-wide text-story-muted">
                            Scene {sceneId}
                          </span>
                          <h3 className="mt-1 font-serif text-xl font-semibold text-story-text">
                            {scene.title || `第${scene.scene_number || index + 1}场`}
                          </h3>
                        </div>
                        <span className="rounded-md border border-story-border px-3 py-2 text-xs text-story-muted">
                          {heading.int_ext} / {heading.time}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                        <div>
                          <dt className="text-story-muted">地点</dt>
                          <dd className="mt-1 text-story-text">{heading.location}</dd>
                        </div>
                        <div>
                          <dt className="text-story-muted">氛围</dt>
                          <dd className="mt-1 text-story-text">{heading.atmosphere || "暂无氛围说明"}</dd>
                        </div>
                        <div className="md:col-span-2">
                          <dt className="text-story-muted">改编目的</dt>
                          <dd className="mt-1 text-story-text">{scene.purpose || scene.summary || "暂无目的说明"}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-story-muted">动作与画面</p>
                          <ul className="mt-2 space-y-2">
                            {actionLines.length ? (
                              actionLines.slice(0, 3).map((line, lineIndex) => (
                                <li key={`${sceneId}-action-${lineIndex}`} className="text-sm leading-6 text-story-text">
                                  {line}
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-story-muted">暂无动作描写</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm text-story-muted">角色对白</p>
                          <ul className="mt-2 space-y-2">
                            {dialogues.length ? (
                              dialogues.slice(0, 2).map((dialogue, dialogueIndex) => (
                                <li
                                  key={`${sceneId}-dialogue-${dialogueIndex}`}
                                  className="text-sm leading-6 text-story-text"
                                >
                                  <span className="text-story-gold">{dialogue.character}</span>
                                  <span className="text-story-muted">: </span>
                                  {dialogue.line || dialogue.text}
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-story-muted">暂无对白</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed border-story-border px-4 py-8 text-center text-sm text-story-muted">
                      暂无场景
                    </div>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default Comparison;

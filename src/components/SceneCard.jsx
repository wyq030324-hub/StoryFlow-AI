import { formatSceneNumber } from "../utils/screenplayFormatter.js";

function getSceneId(scene) {
  return scene.scene_id || scene.id;
}

function getHeading(scene) {
  return (
    scene.heading || {
      int_ext: scene.int_ext || "内景",
      location: scene.location || "未标注地点",
      time: scene.timeOfDay || scene.time || "未标注时间",
      atmosphere: scene.summary || "未标注氛围",
    }
  );
}

function getActionLines(scene) {
  return scene.action_lines || (scene.action ? [scene.action] : []);
}

function getDialogues(scene) {
  return scene.dialogues || scene.dialogue || [];
}

function SceneCard({ scene, isActive = false, onClick }) {
  const sceneId = getSceneId(scene);
  const heading = getHeading(scene);
  const actionLines = getActionLines(scene);
  const dialogues = getDialogues(scene);
  const sceneLabel = formatSceneNumber(scene.scene_number || sceneId?.match(/\d+/)?.[0] || 1);

  return (
    <article
      className={`rounded-lg border p-5 text-sm shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition ${
        isActive
          ? "border-story-gold bg-story-gold/10 shadow-[0_0_0_1px_rgba(201,169,110,0.16),0_22px_70px_rgba(0,0,0,0.28)]"
          : "border-story-border bg-story-card/95"
      } ${onClick ? "cursor-pointer hover:border-story-gold" : ""}`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-story-muted">
            {sceneLabel}
          </p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-story-text">
            {scene.title || "未命名场次"}
          </h3>
        </div>
        <div className="rounded-md border border-story-border px-3 py-2 text-xs text-story-muted">
          {heading.int_ext} / {heading.time}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-story-muted">场景地点</dt>
          <dd className="mt-1 text-story-text">{heading.location}</dd>
        </div>
        <div>
          <dt className="text-story-muted">画面氛围</dt>
          <dd className="mt-1 text-story-text">{heading.atmosphere}</dd>
        </div>
        <div>
          <dt className="text-story-muted">改编目的</dt>
          <dd className="mt-1 text-story-text">
            {scene.purpose || scene.summary || "暂无说明"}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-story-muted">动作与画面</p>
        <ul className="mt-2 space-y-2 text-story-text">
          {actionLines.length ? (
            actionLines.map((line) => (
              <li
                key={line}
                className="rounded-md border border-story-border bg-story-bg/80 px-3 py-2"
              >
                {line}
              </li>
            ))
          ) : (
            <li className="text-story-muted">暂无动作描写</li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-story-muted">角色台词</p>
        <ul className="mt-2 space-y-2">
          {dialogues.length ? (
            dialogues.map((dialogue) => (
              <li
                key={`${dialogue.character}-${dialogue.line}`}
                className="rounded-md border border-story-border px-3 py-2"
              >
                <span className="font-medium text-story-gold">
                  {dialogue.character}
                </span>
                <span className="text-story-muted">：</span>
                <span className="text-story-text">{dialogue.line}</span>
              </li>
            ))
          ) : (
            <li className="text-story-muted">暂无台词</li>
          )}
        </ul>
      </div>
    </article>
  );
}

export default SceneCard;

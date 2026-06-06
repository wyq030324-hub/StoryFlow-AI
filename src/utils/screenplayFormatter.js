function normalizeSceneType(value = "") {
  const text = String(value || "").toUpperCase();

  if (value === "内景" || text === "INT" || text === "INT.") {
    return "内景";
  }

  if (value === "外景" || text === "EXT" || text === "EXT.") {
    return "外景";
  }

  if (String(value).includes("内") && String(value).includes("外")) {
    return "内景 / 外景";
  }

  if (text.includes("EXT")) {
    return "外景";
  }

  return "内景";
}

function getSceneHeading(scene) {
  const heading = scene.heading || {};
  const sceneType = normalizeSceneType(scene.scene_type || scene.int_ext || heading.int_ext);
  const location = scene.location || heading.location || "未标注地点";
  const time = scene.time || scene.timeOfDay || heading.time || "未标注时间";
  return `${sceneType} ${location} ${time}`;
}

function getSceneAtmosphere(scene) {
  return scene.scene_description || scene.heading?.atmosphere || "";
}

function getActionLines(scene) {
  return Array.isArray(scene.action_lines)
    ? scene.action_lines
    : scene.action
      ? [scene.action]
      : [];
}

function getDialogues(scene) {
  return Array.isArray(scene.dialogues) ? scene.dialogues : scene.dialogue || [];
}

function formatDialogue(dialogue) {
  const character = dialogue.character || dialogue.name || "角色";
  const parenthetical = dialogue.parenthetical ? `（${dialogue.parenthetical}）` : "";
  const line = dialogue.line || dialogue.text || "";
  return [character, parenthetical, line].filter(Boolean).join("\n");
}

function normalizeTransition(transition = "") {
  const text = String(transition || "").trim();

  if (!text) {
    return "CUT TO:";
  }

  return text.endsWith(":") ? text : `${text}:`;
}

export function formatSceneHeading(scene) {
  return getSceneHeading(scene);
}

export function formatScreenplay(screenplayDraft) {
  const scenes = screenplayDraft?.scenes || [];

  if (!scenes.length) {
    return "";
  }

  return scenes
    .map((scene, index) => {
      const lines = [];
      const sceneNumber = scene.scene_number || index + 1;

      lines.push(`第 ${sceneNumber} 场`);
      lines.push(getSceneHeading(scene));
      lines.push("");

      const atmosphere = getSceneAtmosphere(scene);
      if (atmosphere) {
        lines.push(atmosphere);
        lines.push("");
      }

      getActionLines(scene).forEach((line) => {
        if (String(line || "").trim()) {
          lines.push(line.trim());
          lines.push("");
        }
      });

      getDialogues(scene).forEach((dialogue) => {
        lines.push(formatDialogue(dialogue));
        lines.push("");
      });

      if (scene.transition || true) {
        lines.push(normalizeTransition(scene.transition));
      }

      return lines.join("\n").trim();
    })
    .join("\n\n");
}

const BANNED_PREFIXES = [
  "主题：",
  "情感：",
  "分析：",
  "人物关系：",
  "改编说明：",
];

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

function sanitizeScriptLine(value = "") {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  if (BANNED_PREFIXES.some((prefix) => text.startsWith(prefix))) {
    return "";
  }

  return text;
}

function getSceneHeading(scene) {
  const heading = scene.heading || {};
  const sceneType = normalizeSceneType(scene.scene_type || scene.int_ext || heading.int_ext);
  const location = scene.location || heading.location || "未标注地点";
  const time = scene.time || scene.timeOfDay || heading.time || "未标注时间";
  return `${sceneType} ${location} ${time}`;
}

function getActionLines(scene) {
  return (Array.isArray(scene.action_lines) ? scene.action_lines : [])
    .map(sanitizeScriptLine)
    .filter(Boolean);
}

function getDialogues(scene) {
  return Array.isArray(scene.dialogues) ? scene.dialogues : scene.dialogue || [];
}

function formatDialogue(dialogue) {
  const character = String(dialogue.character || dialogue.name || "角色").trim();
  const parenthetical = sanitizeScriptLine(dialogue.parenthetical || "");
  const line = sanitizeScriptLine(dialogue.line || dialogue.text || "");
  const parts = [character];

  if (parenthetical) {
    parts.push(`（${parenthetical}）`);
  }

  if (line) {
    parts.push(line);
  }

  return parts.join("\n");
}

function normalizeTransition(transition = "") {
  const text = sanitizeScriptLine(transition);

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

      lines.push(`第${sceneNumber}场`);
      lines.push("");
      lines.push(getSceneHeading(scene));
      lines.push("");

      getActionLines(scene).forEach((line) => {
        lines.push(line);
        lines.push("");
      });

      getDialogues(scene).forEach((dialogue) => {
        const formatted = formatDialogue(dialogue);
        if (formatted.trim()) {
          lines.push(formatted);
          lines.push("");
        }
      });

      const narrator = sanitizeScriptLine(scene.narration || scene.voice_over || "");
      if (narrator) {
        lines.push("旁白");
        lines.push(narrator);
        lines.push("");
      }

      const soundHint = sanitizeScriptLine(
        scene.sound_design_hint?.key_sound || scene.sound_design_hint?.ambient || "",
      );
      if (soundHint) {
        lines.push("音效");
        lines.push(soundHint);
        lines.push("");
      }

      lines.push(normalizeTransition(scene.transition));

      return lines.join("\n").trim();
    })
    .join("\n\n");
}

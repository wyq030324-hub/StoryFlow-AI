const BANNED_PREFIXES = [
  "主题：",
  "情感：",
  "分析：",
  "人物关系：",
  "改编说明：",
  "导演建议：",
  "审查结果：",
];

const chineseNumbers = [
  "",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
];

const dialoguePunctuationPattern = /[。！？…!?]$/;
const dialogueQuotePattern = /^["“].*["”]$/s;

export function formatSceneNumber(value, fallback = 1) {
  const number = Number(value || fallback);

  if (number > 0 && number <= 10) {
    return `第${chineseNumbers[number]}场`;
  }

  return `第${number}场`;
}

export function formatParagraphNumber(value) {
  const number = Number(value || 1);

  if (number > 0 && number <= 10) {
    return `第${chineseNumbers[number]}段`;
  }

  return `第${number}段`;
}

function normalizeSceneType(value = "") {
  const text = String(value || "").trim().toUpperCase();

  if (["外景", "EXT", "EXT."].includes(text)) {
    return "外景";
  }

  if (text.includes("外") && text.includes("内")) {
    return "内景 / 外景";
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

function sanitizeScriptText(value = "") {
  return String(value || "")
    .split(/\r?\n/)
    .map(sanitizeScriptLine)
    .filter(Boolean)
    .join("\n");
}

function getSceneHeading(scene) {
  const heading = scene?.heading || {};
  const sceneType = normalizeSceneType(scene?.scene_type || scene?.int_ext || heading.int_ext);
  const location = scene?.location || heading.location || "未标注地点";
  const time = scene?.time || scene?.timeOfDay || heading.time || "未标注时间";

  return `${sceneType} ${location} ${time}`;
}

function getActionLines(scene) {
  return (Array.isArray(scene?.action_lines) ? scene.action_lines : [])
    .map(sanitizeScriptLine)
    .filter(Boolean);
}

function getDialogues(scene) {
  return Array.isArray(scene?.dialogues) ? scene.dialogues : scene?.dialogue || [];
}

function normalizeParenthetical(value = "") {
  const text = sanitizeScriptLine(value);

  if (!text) {
    return "";
  }

  if (/^（.*）$/.test(text)) {
    return text;
  }

  return `（${text.replace(/^[（(]+|[）)]+$/g, "")}）`;
}

function normalizeDialogueLine(value = "") {
  const text = sanitizeScriptLine(value);

  if (!text) {
    return "";
  }

  const unwrapped = text.replace(/^["“]+|["”]+$/g, "").trim();

  if (!unwrapped) {
    return "";
  }

  const withPunctuation = dialoguePunctuationPattern.test(unwrapped)
    ? unwrapped
    : `${unwrapped}。`;

  if (dialogueQuotePattern.test(text)) {
    return `“${withPunctuation.replace(/^["“]+|["”]+$/g, "")}”`;
  }

  return `“${withPunctuation}”`;
}

function formatDialogue(dialogue) {
  const character = String(dialogue?.character || dialogue?.name || "角色").trim();
  const parenthetical = normalizeParenthetical(dialogue?.parenthetical || dialogue?.emotion || "");
  const line = normalizeDialogueLine(dialogue?.line || dialogue?.text || "");
  const parts = [character];

  if (parenthetical) {
    parts.push(parenthetical);
  }

  if (line) {
    parts.push(line);
  }

  return parts.filter(Boolean).join("\n");
}

function normalizeTransition(transition = "") {
  const text = sanitizeScriptLine(transition);

  if (!text) {
    return "CUT TO:";
  }

  return text.endsWith(":") || text.endsWith("：") ? text : `${text}:`;
}

export function formatSceneHeading(scene) {
  return getSceneHeading(scene);
}

export function splitScreenplayIntoSections(screenplayText = "") {
  const text = sanitizeScriptText(screenplayText);

  if (!text) {
    return [];
  }

  const matches = [...text.matchAll(/(?=第[一二三四五六七八九十\d]+场)/g)];

  if (!matches.length) {
    return [text];
  }

  return matches
    .map((match, index) => {
      const start = match.index || 0;
      const end = matches[index + 1]?.index ?? text.length;
      return text.slice(start, end).trim();
    })
    .filter(Boolean);
}

export function formatScreenplay(screenplayDraft) {
  const scriptText =
    screenplayDraft?.screenplayText ||
    screenplayDraft?.screenplay_text ||
    screenplayDraft?.script ||
    screenplayDraft?.content ||
    "";

  if (scriptText) {
    return sanitizeScriptText(scriptText);
  }

  const scenes = screenplayDraft?.scenes || [];

  if (!scenes.length) {
    return "";
  }

  return scenes
    .map((scene, index) => {
      const lines = [];
      const sceneNumber = scene.scene_number || index + 1;

      lines.push(formatSceneNumber(sceneNumber, index + 1));
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
        lines.push(normalizeDialogueLine(narrator));
        lines.push("");
      }

      lines.push(normalizeTransition(scene.transition));

      return lines.join("\n").trim();
    })
    .join("\n\n");
}

export function downloadTextFile(filename, content) {
  const blob = new Blob([content || ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

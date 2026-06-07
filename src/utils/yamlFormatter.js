import { normalizeEmotionalArc } from "./emotionalArc.js";

function quote(value) {
  if (value === null || value === undefined || value === "") {
    return '""';
  }

  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function blockLines(value, indent = 4) {
  const padding = " ".repeat(indent);
  const text = value ? String(value) : "";

  if (!text.trim()) {
    return [`${padding}""`];
  }

  return text.split("\n").map((line) => `${padding}${line}`);
}

function listValues(values, indent = 2) {
  const padding = " ".repeat(indent);

  if (!values?.length) {
    return [`${padding}[]`];
  }

  return values.map((value) => `${padding}- ${quote(value)}`);
}

function getSceneId(scene) {
  return scene.scene_id || scene.id;
}

function getHeading(scene) {
  return (
    scene.heading || {
      int_ext: scene.int_ext || "INT.",
      location: scene.location,
      time: scene.time || scene.timeOfDay,
      atmosphere: scene.scene_description || scene.summary,
    }
  );
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

export function generateYaml(screenplayDraft, reviewResult) {
  const draft = screenplayDraft || {};
  const screenplay = draft.screenplay || {};
  const scenes = draft.scenes || [];
  const emotionalArc = normalizeEmotionalArc(draft.emotional_arc, "yaml.emotionalArc");
  const review = reviewResult || {};
  const scores = review.scores || {};
  const lines = [];

  lines.push("screenplay:");
  lines.push(`  title: ${quote(screenplay.title)}`);
  lines.push(`  episode: ${quote(screenplay.episode)}`);
  lines.push(`  format: ${quote(screenplay.format)}`);
  lines.push(`chapter_source: ${quote(draft.chapter_source)}`);
  lines.push(`theme: ${quote(draft.theme)}`);

  lines.push("emotional_arc:");
  if (emotionalArc.length) {
    emotionalArc.forEach((beat) => {
      lines.push(`  - ${quote(beat)}`);
    });
  } else {
    lines.push("  []");
  }

  lines.push("scenes:");
  if (scenes.length) {
    scenes.forEach((scene) => {
      const heading = getHeading(scene);
      const actionLines = getActionLines(scene);
      const dialogues = getDialogues(scene);
      const characters = scene.characters_present || scene.characters || [];

      lines.push(`  - scene_id: ${quote(getSceneId(scene))}`);
      lines.push(`    scene_number: ${scene.scene_number ?? scene.order ?? 0}`);
      lines.push(`    int_ext: ${quote(scene.int_ext || scene.scene_type || heading.int_ext)}`);
      lines.push(`    location: ${quote(scene.location || heading.location)}`);
      lines.push(`    time: ${quote(scene.time || scene.timeOfDay || heading.time)}`);
      lines.push(`    purpose: ${quote(scene.purpose || scene.dramatic_purpose || "")}`);
      lines.push("    heading:");
      lines.push(`      int_ext: ${quote(heading.int_ext)}`);
      lines.push(`      location: ${quote(heading.location)}`);
      lines.push(`      time: ${quote(heading.time)}`);
      lines.push(`      atmosphere: ${quote(heading.atmosphere)}`);
      lines.push("    characters_present:");
      lines.push(...listValues(characters, 6));
      lines.push("    action_lines:");
      if (actionLines.length) {
        actionLines.forEach((line) => {
          lines.push("      - |");
          lines.push(...blockLines(line, 8));
        });
      } else {
        lines.push("      []");
      }
      lines.push("    dialogues:");
      if (dialogues.length) {
        dialogues.forEach((dialogue) => {
          lines.push(`      - character: ${quote(dialogue.character)}`);
          lines.push(`        line: ${quote(dialogue.line || dialogue.text)}`);
        });
      } else {
        lines.push("      []");
      }
      lines.push(`    transition: ${quote(scene.transition)}`);
    });
  } else {
    lines.push("  []");
  }

  lines.push("review:");
  lines.push("  summary: |");
  lines.push(...blockLines(review.summary, 4));
  lines.push("  issues:");
  lines.push(...listValues(review.issues || review.riskFlags, 4));
  lines.push("  suggestions:");
  lines.push(...listValues(review.suggestions || review.revisionSuggestions, 4));

  lines.push("scores:");
  Object.entries(scores).forEach(([key, value]) => {
    lines.push(`  ${key}: ${Number(value) || 0}`);
  });

  return `${lines.join("\n")}\n`;
}

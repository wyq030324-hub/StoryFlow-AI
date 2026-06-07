import { detectChapters } from "./chapterParser.js";
import { formatSceneNumber, formatScreenplay, splitScreenplayIntoSections } from "./screenplayFormatter.js";

function quote(value) {
  if (value === null || value === undefined || value === "") {
    return '""';
  }

  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function block(value, indent = 4) {
  const padding = " ".repeat(indent);
  const text = String(value || "").trim();

  if (!text) {
    return [`${padding}""`];
  }

  return text.split(/\r?\n/).map((line) => `${padding}${line}`);
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  return [value];
}

function sceneId(index) {
  return `scene_${String(index + 1).padStart(3, "0")}`;
}

function characterId(index) {
  return `char_${String(index + 1).padStart(3, "0")}`;
}

function getCharacterName(character) {
  if (typeof character === "string") {
    return character;
  }

  return character?.name || character?.character || "";
}

function getSceneCharacters(scene) {
  const fromScene = normalizeArray(scene?.characters_present || scene?.characters)
    .map(getCharacterName)
    .filter(Boolean);
  const fromDialogues = normalizeArray(scene?.dialogues || scene?.dialogue)
    .map((dialogue) => dialogue?.character || dialogue?.name)
    .filter(Boolean);

  return [...new Set([...fromScene, ...fromDialogues])];
}

function collectCharacters(scenes, screenplayText) {
  const names = new Set();

  scenes.forEach((scene) => {
    getSceneCharacters(scene).forEach((name) => names.add(name));
  });

  if (!names.size) {
    const lines = String(screenplayText || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    lines.forEach((line, index) => {
      const next = lines[index + 1] || "";
      const looksLikeCharacter =
        /^[\u4e00-\u9fa5A-Za-z·]{2,12}$/.test(line) &&
        next &&
        !/^(第一|第二|第三|第四|第五|第\d+|内景|外景|CUT TO|FADE)/i.test(line);

      if (looksLikeCharacter) {
        names.add(line);
      }
    });
  }

  const list = [...names].slice(0, 12);

  if (!list.length) {
    list.push("待补充人物");
  }

  return list.map((name, index) => ({
    id: characterId(index),
    name,
    role: index === 0 ? "主角" : "角色",
    description: "由小说文本和剧本内容提取，可继续编辑完善。",
  }));
}

function parseDialoguesFromText(text = "") {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const dialogues = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    const current = lines[index];
    const next = lines[index + 1];
    const looksLikeName =
      /^[\u4e00-\u9fa5A-Za-z·]{2,12}$/.test(current) &&
      !/^(第一|第二|第三|第四|第五|第\d+|内景|外景|CUT TO|FADE)/i.test(current);

    if (looksLikeName && next && !/^(第一|第二|第三|第四|第五|第\d+|内景|外景|CUT TO|FADE)/i.test(next)) {
      dialogues.push({
        character: current,
        emotion: "",
        line: next.replace(/^（.*?）/, "").trim(),
      });
      index += 1;
    }
  }

  return dialogues.slice(0, 8);
}

function parseActionFromText(text = "") {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(第一|第二|第三|第四|第五|第\d+).{0,8}场/.test(line))
    .filter((line) => !/^(内景|外景|CUT TO|FADE)/i.test(line))
    .filter((line) => !/^[\u4e00-\u9fa5A-Za-z·]{2,12}$/.test(line));

  return lines.slice(0, 4).join(" ");
}

function normalizeDialogue(dialogue) {
  return {
    character: dialogue?.character || dialogue?.name || "角色",
    emotion: dialogue?.emotion || dialogue?.parenthetical || "",
    line: dialogue?.line || dialogue?.text || "",
  };
}

function normalizeScene(scene, index, fallbackText = "") {
  const heading = scene?.heading || {};
  const sceneNumber = scene?.scene_number || index + 1;
  const textDialogues = fallbackText ? parseDialoguesFromText(fallbackText) : [];
  const dialogues = normalizeArray(scene?.dialogues || scene?.dialogue)
    .map(normalizeDialogue)
    .filter((dialogue) => dialogue.line);
  const actionLines = normalizeArray(scene?.action_lines || scene?.action).filter(Boolean);
  const characters = getSceneCharacters(scene);
  const location = scene?.location || heading.location || "未标注地点";
  const time = scene?.time || scene?.timeOfDay || heading.time || "未标注时间";
  const interiorExterior = scene?.scene_type || scene?.int_ext || heading.int_ext || "内景";

  return {
    scene_id: scene?.scene_id || sceneId(index),
    scene_title:
      scene?.scene_title ||
      scene?.title ||
      `${formatSceneNumber(sceneNumber)} ${location} / ${time} / ${interiorExterior}`,
    location,
    time,
    interior_exterior: interiorExterior,
    characters: characters.length ? characters : textDialogues.map((dialogue) => dialogue.character),
    action:
      actionLines.join(" ") ||
      scene?.scene_description ||
      scene?.summary ||
      parseActionFromText(fallbackText) ||
      "根据原文生成的剧本场面，可继续补充动作描写。",
    dialogues: dialogues.length ? dialogues : textDialogues,
    purpose:
      scene?.purpose ||
      scene?.dramatic_purpose ||
      "推进章节剧情，建立人物行动与戏剧冲突。",
  };
}

function normalizeScenes(screenplayDraft, screenplayText) {
  const scenes = screenplayDraft?.scenes || [];

  if (scenes.length) {
    return scenes.map((scene, index) => normalizeScene(scene, index));
  }

  const sections = splitScreenplayIntoSections(screenplayText);

  if (sections.length) {
    return sections.map((section, index) => normalizeScene(null, index, section));
  }

  return [normalizeScene(null, 0, screenplayText)];
}

function distributeScenesAcrossChapters(chapters, scenes) {
  if (!scenes.length) {
    return chapters.map((chapter, index) => ({
      ...chapter,
      scenes: [normalizeScene(null, index, chapter.content)],
    }));
  }

  return chapters.map((chapter, chapterIndex) => {
    const assigned = scenes.filter((_, sceneIndex) => {
      const targetChapter = Math.min(
        chapters.length - 1,
        Math.floor((sceneIndex / scenes.length) * chapters.length),
      );
      return targetChapter === chapterIndex;
    });

    return {
      ...chapter,
      scenes: assigned.length ? assigned : [normalizeScene(null, chapterIndex, chapter.content)],
    };
  });
}

function pushList(lines, values, indent = 4) {
  const padding = " ".repeat(indent);

  if (!values.length) {
    lines.push(`${padding}[]`);
    return;
  }

  values.forEach((value) => {
    lines.push(`${padding}- ${quote(value)}`);
  });
}

export function buildStructuredScreenplayYaml({
  title = "",
  novelInput = null,
  screenplayDraft = null,
} = {}) {
  const screenplayText =
    screenplayDraft?.screenplayText ||
    screenplayDraft?.scriptText ||
    formatScreenplay(screenplayDraft);
  const sourceText = novelInput?.content || screenplayDraft?.chapter_source || screenplayText;
  const chapterInfo = detectChapters(sourceText);
  const chapters = chapterInfo.chapters.length
    ? chapterInfo.chapters
    : [
        {
          chapter_id: "chapter_001",
          title: title || "未命名章节",
          content: sourceText,
          index: 0,
          source: "fallback",
        },
      ];
  const normalizedScenes = normalizeScenes(screenplayDraft, screenplayText);
  const chaptersWithScenes = distributeScenesAcrossChapters(chapters, normalizedScenes);
  const characters = collectCharacters(normalizedScenes, screenplayText);
  const finalTitle = title || novelInput?.title || screenplayDraft?.screenplay?.title || "未命名作品";
  const lines = [];

  lines.push(`title: ${quote(finalTitle)}`);
  lines.push('source_type: "novel"');
  lines.push(`chapter_count: ${chaptersWithScenes.length}`);
  lines.push("characters:");
  characters.forEach((character) => {
    lines.push(`  - id: ${quote(character.id)}`);
    lines.push(`    name: ${quote(character.name)}`);
    lines.push(`    role: ${quote(character.role)}`);
    lines.push(`    description: ${quote(character.description)}`);
  });
  lines.push("chapters:");
  chaptersWithScenes.forEach((chapter, chapterIndex) => {
    lines.push(`  - chapter_id: ${quote(chapter.chapter_id || `chapter_${String(chapterIndex + 1).padStart(3, "0")}`)}`);
    lines.push(`    title: ${quote(chapter.title || `第${chapterIndex + 1}章`)}`);
    lines.push("    summary: |");
    lines.push(...block(chapter.content.slice(0, 220), 6));
    lines.push("    scenes:");
    chapter.scenes.forEach((scene, sceneIndex) => {
      lines.push(`      - scene_id: ${quote(scene.scene_id || sceneId(sceneIndex))}`);
      lines.push(`        scene_title: ${quote(scene.scene_title)}`);
      lines.push(`        location: ${quote(scene.location)}`);
      lines.push(`        time: ${quote(scene.time)}`);
      lines.push(`        interior_exterior: ${quote(scene.interior_exterior)}`);
      lines.push("        characters:");
      pushList(lines, scene.characters || [], 10);
      lines.push("        action: |");
      lines.push(...block(scene.action, 10));
      lines.push("        dialogues:");
      if (scene.dialogues?.length) {
        scene.dialogues.forEach((dialogue) => {
          lines.push(`          - character: ${quote(dialogue.character)}`);
          lines.push(`            emotion: ${quote(dialogue.emotion)}`);
          lines.push(`            line: ${quote(dialogue.line)}`);
        });
      } else {
        lines.push("          []");
      }
      lines.push(`        purpose: ${quote(scene.purpose)}`);
    });
  });

  return `${lines.join("\n")}\n`;
}

export function generateYaml(screenplayDraft, _reviewResult, options = {}) {
  return buildStructuredScreenplayYaml({
    title: options.title,
    novelInput: options.novelInput,
    screenplayDraft,
  });
}

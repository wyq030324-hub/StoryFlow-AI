const chapterHeadingPattern =
  /^\s*((?:第[〇零一二三四五六七八九十百千\d]+章)|(?:Chapter\s*\d+)|(?:CHAPTER\s*\d+))\s*([^\n\r]*)/i;

function normalizeLineBreaks(text = "") {
  return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function buildParagraphChunks(text) {
  const paragraphs = normalizeLineBreaks(text)
    .split(/\n{2,}|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return [];
  }

  const targetCount = Math.min(Math.max(paragraphs.length, 1), 3);
  const chunkSize = Math.ceil(paragraphs.length / targetCount);

  return Array.from({ length: targetCount }, (_, index) => {
    const content = paragraphs
      .slice(index * chunkSize, (index + 1) * chunkSize)
      .join("\n\n")
      .trim();

    return {
      chapter_id: `chapter_${String(index + 1).padStart(3, "0")}`,
      title: `第${index + 1}段自动拆分`,
      content,
      index,
      source: "paragraph",
    };
  }).filter((chapter) => chapter.content);
}

export function detectChapters(text = "") {
  const normalizedText = normalizeLineBreaks(text);
  const lines = normalizedText.split("\n");
  const headings = [];
  let offset = 0;

  lines.forEach((line) => {
    const match = line.match(chapterHeadingPattern);

    if (match) {
      headings.push({
        title: line.trim(),
        start: offset,
      });
    }

    offset += line.length + 1;
  });

  if (headings.length) {
    const chapters = headings.map((heading, index) => {
      const end = headings[index + 1]?.start ?? normalizedText.length;
      const content = normalizedText.slice(heading.start, end).trim();

      return {
        chapter_id: `chapter_${String(index + 1).padStart(3, "0")}`,
        title: heading.title,
        content,
        index,
        source: "heading",
      };
    });

    return {
      chapters,
      count: chapters.length,
      hasExplicitChapters: true,
      isAutoSplit: false,
      message:
        chapters.length >= 3
          ? `已识别章节数：${chapters.length}章，当前将按章节生成剧本初稿。`
          : `已识别章节数：${chapters.length}章。`,
    };
  }

  const chapters = buildParagraphChunks(normalizedText);

  return {
    chapters,
    count: chapters.length,
    hasExplicitChapters: false,
    isAutoSplit: true,
    message: chapters.length
      ? "未检测到明确章节标题，已按段落自动拆分。"
      : "请输入小说文本后识别章节。",
  };
}

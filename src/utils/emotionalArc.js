function splitArcString(value) {
  return String(value)
    .split(/(?:\r?\n|→|->|，|,|、|；|;|\|)/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeEmotionalArc(emotionalArc, debugLabel = "emotionalArc") {
  const rawType = Array.isArray(emotionalArc)
    ? "array"
    : emotionalArc === null
      ? "null"
      : typeof emotionalArc;

  let normalized = [];

  if (Array.isArray(emotionalArc)) {
    normalized = emotionalArc
      .flatMap((item) => {
        if (typeof item === "string") {
          return splitArcString(item);
        }

        if (item && typeof item === "object") {
          const beat = item.beat || item.stage || "";
          const emotion = item.emotion || item.value || "";
          const merged = [beat, emotion].filter(Boolean).join(" - ");
          return merged ? [merged] : Object.values(item).map((value) => String(value || "").trim()).filter(Boolean);
        }

        return [];
      })
      .filter(Boolean);
  } else if (typeof emotionalArc === "string") {
    normalized = splitArcString(emotionalArc);
  } else if (emotionalArc && typeof emotionalArc === "object") {
    normalized = Object.values(emotionalArc)
      .flatMap((value) => {
        if (typeof value === "string") {
          return splitArcString(value);
        }

        if (value && typeof value === "object") {
          return Object.values(value).map((item) => String(item || "").trim()).filter(Boolean);
        }

        return [];
      })
      .filter(Boolean);
  }

  console.debug(`[StoryFlow] ${debugLabel} raw type:`, rawType);
  console.debug(`[StoryFlow] ${debugLabel} raw value:`, emotionalArc);
  console.debug(`[StoryFlow] ${debugLabel} normalized:`, normalized);

  return normalized;
}

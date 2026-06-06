export function createJsonGuardError(message, detail = "") {
  return {
    ok: false,
    error: "JSON_PARSE_FAILED",
    message,
    detail,
  };
}

export function extractJsonText(text = "") {
  const source = String(text).trim();

  if (!source) {
    throw createJsonGuardError("模型返回内容为空，无法解析 JSON");
  }

  const fencedMatch = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : source;
  const firstObject = candidate.indexOf("{");
  const firstArray = candidate.indexOf("[");
  const starts = [firstObject, firstArray].filter((index) => index >= 0);

  if (!starts.length) {
    throw createJsonGuardError("模型返回内容不是合法 JSON", "未找到 JSON 起始符");
  }

  const start = Math.min(...starts);
  const openingChar = candidate[start];
  const closingChar = openingChar === "{" ? "}" : "]";
  const end = candidate.lastIndexOf(closingChar);

  if (end < start) {
    throw createJsonGuardError("模型返回内容不是合法 JSON", "未找到 JSON 结束符");
  }

  return candidate.slice(start, end + 1);
}

export function parseJsonSafely(text = "") {
  try {
    return JSON.parse(extractJsonText(text));
  } catch (error) {
    if (error?.error === "JSON_PARSE_FAILED") {
      throw error;
    }

    throw createJsonGuardError(
      "模型返回内容不是合法 JSON",
      error?.message || "JSON.parse 失败",
    );
  }
}

export function normalizeDeepSeekPayload(payload) {
  const rawText =
    payload?.choices?.[0]?.message?.content ||
    payload?.choices?.[0]?.text ||
    payload?.content ||
    "";

  try {
    return {
      ok: true,
      rawText,
      data: parseJsonSafely(rawText),
    };
  } catch (error) {
    return {
      ...error,
      rawText,
    };
  }
}

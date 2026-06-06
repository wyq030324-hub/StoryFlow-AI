export const characterGraph = {
  nodes: [
    {
      id: "lin-zhao",
      name: "林照",
      role: "主角",
      archetype: "记忆追寻者",
      importance: 100,
      emotionalState: "压抑、警觉、正在从被动守护转向主动追查",
      arc: "从档案馆的守门人，逐步成为旧城记忆真相的追索者，并最终必须判断自己是否愿意承担被改写的家族历史。",
      scenes: ["第 1 场 午夜档案馆", "第 2 场 照片夹层", "第 4 场 灯塔切开海雾"],
      directorNote:
        "镜头应始终让林照保持克制，她的情绪不靠大哭爆发，而靠停顿、注视和迟疑来传达。",
      narrativeFunction:
        "叙事中心。她连接父女线、情感线、冲突线和记忆线，是观众进入悬疑奇幻世界的视角锚点。",
      position3d: { x: 50, y: 50, z: 84 },
    },
    {
      id: "su-wan",
      name: "苏晚",
      role: "情感线角色",
      archetype: "见证者",
      importance: 82,
      emotionalState: "温柔但有保留，对林照既保护又隐瞒",
      arc: "从旁观旧城事件的见证者，转变为愿意陪林照走入真相的人，并暴露自己与沉船案的间接关联。",
      scenes: ["第二幕 旧城码头", "第二幕 雨夜修船厂", "第三幕 海雾天台"],
      directorNote:
        "苏晚的表演需要有双层信息：表面安慰林照，眼神里却藏着对旧事的恐惧。",
      narrativeFunction:
        "情感缓冲和观众共情入口。她能把高概念悬疑拉回具体的人际关系。",
      position3d: { x: 70, y: 31, z: 48 },
    },
    {
      id: "old-archivist",
      name: "档案馆老人",
      role: "导师型角色",
      archetype: "规则解释者",
      importance: 70,
      emotionalState: "冷静、疲惫、对规则有敬畏",
      arc: "从看似阻止林照查案的管理者，逐渐显露为旧规则的幸存者，最后给出关键提示。",
      scenes: ["第 1 场 午夜档案馆", "第 3 场 门缝录音", "后续 档案馆停电"],
      directorNote:
        "老人不应演成传统解说角色，他每次给信息都要付出代价，像是在违抗一套仍然有效的规则。",
      narrativeFunction:
        "世界规则的出口。负责解释潮汐档案、记忆改写和旧城失踪案之间的关系。",
      position3d: { x: 30, y: 34, z: 34 },
    },
    {
      id: "tide-judge",
      name: "潮汐审判者",
      role: "对立角色",
      archetype: "冲突制造者",
      importance: 90,
      emotionalState: "冷酷、审判式、对人的记忆没有怜悯",
      arc: "从门外来客背后的阴影，逐步显形为掌控旧城记忆规则的真正对手。",
      scenes: ["第 3 场 门缝录音", "第 4 场 灯塔切开海雾", "第三幕 潮汐审判"],
      directorNote:
        "不要让反派只靠台词解释威胁。最好通过环境反应、灯光变化和他人沉默来证明其压迫感。",
      narrativeFunction:
        "高张力冲突源。负责把林照的私人追查升级为关于身份、记忆和城市真相的对抗。",
      position3d: { x: 76, y: 68, z: 62 },
    },
    {
      id: "missing-mother",
      name: "失踪母亲",
      role: "记忆源点",
      archetype: "隐性驱动力",
      importance: 88,
      emotionalState: "缺席、沉默、像被潮汐反复冲刷的旧照片",
      arc: "从林照记忆中的缺口，逐步变成整个沉船案的情感源点和第二幕爆发的关键。",
      scenes: ["第 2 场 照片夹层", "后续 母亲旧箱", "第三幕 被改写的合照"],
      directorNote:
        "母亲可以长期不正面出现，但每次出现都必须改变林照对父亲、旧城和自己的判断。",
      narrativeFunction:
        "隐性驱动力。她不直接推动情节，却决定林照为什么必须继续追查。",
      position3d: { x: 24, y: 70, z: 20 },
    },
  ],
  edges: [
    {
      source: "lin-zhao",
      target: "su-wan",
      type: "emotion",
      label: "情感线",
      strength: 86,
      tension: 42,
      directorMeaning:
        "这条线适合承担观众情绪缓冲，让林照的孤独和危险被具体的人际陪伴照亮。",
    },
    {
      source: "lin-zhao",
      target: "old-archivist",
      type: "mentor",
      label: "师徒线",
      strength: 72,
      tension: 20,
      directorMeaning:
        "老人负责交付规则，但每次提示都应伴随新的限制，避免成为单纯说明书角色。",
    },
    {
      source: "lin-zhao",
      target: "tide-judge",
      type: "conflict",
      label: "冲突线",
      strength: 91,
      tension: 95,
      directorMeaning:
        "这是最危险的主冲突线，可作为每集结尾钩子，让记忆追查不断升级为现实威胁。",
    },
    {
      source: "lin-zhao",
      target: "missing-mother",
      type: "memory",
      label: "记忆线",
      strength: 95,
      tension: 70,
      directorMeaning:
        "母亲线是第二幕情感爆发点，适合在主角接近真相时反向刺痛她的家庭认知。",
    },
    {
      source: "su-wan",
      target: "missing-mother",
      type: "memory",
      label: "旧事见证",
      strength: 64,
      tension: 58,
      directorMeaning:
        "苏晚可能知道母亲失踪前的某个细节，这能把情感线转成关键证词。",
    },
    {
      source: "old-archivist",
      target: "tide-judge",
      type: "conflict",
      label: "规则对抗",
      strength: 76,
      tension: 82,
      directorMeaning:
        "老人不是纯粹帮助者，他与审判者之间的旧怨能补足世界观和前史。",
    },
    {
      source: "tide-judge",
      target: "missing-mother",
      type: "memory",
      label: "被封存的真相",
      strength: 88,
      tension: 86,
      directorMeaning:
        "这条线建议后置揭露，用来证明母亲不是受害者符号，而是曾经接近核心真相的人。",
    },
  ],
  report: {
    narrativeCenter: "林照",
    strongestEmotionLine: "林照 ↔ 苏晚",
    highestConflictLine: "林照 ↔ 潮汐审判者",
    adaptationFocus: "失踪母亲的记忆线可以作为第二幕情感爆发点，推动主角从查案转向自我身份追问。",
    directorSuggestion:
      "当前人物关系适合改编为悬疑奇幻短剧，重点突出“记忆与身份”的冲突，并用每集结尾强化潮汐审判者带来的现实威胁。",
  },
};

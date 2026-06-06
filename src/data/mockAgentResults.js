export const agent1_analyzer = {
  chapter_source: "潮汐归档人 / 第一章：午夜卷宗",
  logline:
    "档案管理员林照在深夜发现父亲与旧城沉船案有关，随即被卷入一场关于城市记忆被篡改的阴谋。",
  theme: "个体记忆对抗被抹除的公共真相",
  tone: "冷峻、潮湿、悬疑推进",
  coreConflict:
    "林照必须判断父亲留下的线索是否可信，同时避开试图改写沉船案记录的未知势力。",
  protagonist: {
    name: "林照",
    role: "临港旧城档案管理员",
    desire: "查清父亲失踪前的真实行动",
    fear: "发现父亲并非受害者，而是篡改记忆计划的参与者",
  },
  characters: [
    {
      name: "林照",
      function: "主角，负责带观众进入档案馆与沉船案谜团。",
    },
    {
      name: "林父",
      function: "缺席角色，以照片和录音推动悬念，是情感线核心。",
    },
    {
      name: "门外来客",
      function: "外部压力源，提示未知组织已经盯上档案馆。",
    },
    {
      name: "旧友周屿",
      function: "后续追查搭档，可承接共同创伤与潜在爱情线。",
    },
    {
      name: "林母",
      function: "家庭隐瞒的承受者，连接父亲失踪与林照情感弱点。",
    },
  ],
  character_relationships: [
    {
      from: "林照",
      to: "林父",
      relation: "父女关系",
      emotions: ["信任", "亏欠", "寻找"],
      intensity: 92,
    },
    {
      from: "林照",
      to: "门外来客",
      relation: "对立关系",
      emotions: ["威胁", "试探", "秘密"],
      intensity: 78,
    },
    {
      from: "林照",
      to: "旧友周屿",
      relation: "旧友情感",
      emotions: ["陪伴", "共同创伤", "潜在爱情"],
      intensity: 74,
    },
    {
      from: "林照",
      to: "林母",
      relation: "母女关系",
      emotions: ["保护", "沉默", "隐瞒"],
      intensity: 68,
    },
  ],
  emotional_arc: [
    "例行夜班的疲惫",
    "发现照片后的震动",
    "听见录音后的恐惧",
    "意识到使命后的决断",
  ],
  visual_motifs: ["潮水", "旧档案柜", "褪色印章", "灯塔光束", "磁带杂音"],
  scene_candidates: [
    "档案馆深夜整理卷宗",
    "照片揭示父亲与沉船案",
    "门外敲门与录音机出现",
    "灯塔光束下的使命确认",
  ],
};

export const agent2_planner = {
  target_format: "竖屏悬疑短剧单集",
  estimated_duration: "4-6 分钟",
  adaptation_strategy:
    "保留原文潮湿、压迫的氛围，将内心震动转化为可拍摄动作、明确场景目标和连续悬念钩子。",
  pacing: {
    opening: "用潮水和孤灯建立氛围，前三十秒抛出沉船案卷宗。",
    midpoint: "照片揭露父亲关联，私人情感反向卷入公共案件。",
    ending: "录音警告与灯塔画面叠加，形成下一集追查钩子。",
  },
  scenePlan: [
    {
      id: "sc-001",
      title: "午夜档案馆",
      sourceParagraphs: [1],
      dramaticBeat: "主角在普通夜班中触碰禁忌卷宗。",
      conflict: "林照想尽快结束工作，但异常卷宗迫使她停下。",
      visualFocus: "潮水倒映窗光，铁柜深处的褪色印章。",
    },
    {
      id: "sc-002",
      title: "照片夹层",
      sourceParagraphs: [2],
      dramaticBeat: "父亲出现在失踪渡轮照片中，私人情感卷入公共案件。",
      conflict: "林照的记忆与档案记录发生冲突。",
      visualFocus: "湿痕照片、父亲手背伤疤、林照自己的手。",
    },
    {
      id: "sc-003",
      title: "门缝里的录音机",
      sourceParagraphs: [3],
      dramaticBeat: "外部威胁抵达，父亲录音确认阴谋存在。",
      conflict: "门外来客逼近，林照必须决定是否继续听下去。",
      visualFocus: "黑暗楼梯、门缝红灯、磁带转轮。",
    },
    {
      id: "sc-004",
      title: "灯塔切开海雾",
      sourceParagraphs: [4],
      dramaticBeat: "主角完成使命认知，故事进入追查线。",
      conflict: "保命和追真相之间形成选择。",
      visualFocus: "灯塔光束扫过照片，城市在海雾中失焦。",
    },
  ],
};

export const agent3_writer = {
  screenplay: {
    title: "潮汐归档人",
    episode: "EP01",
    format: "professional_short_drama_screenplay",
  },
  chapter_source: "潮汐归档人 / 第一章：午夜卷宗",
  theme: "个体记忆对抗被抹除的公共真相",
  emotional_arc: [
    {
      beat: "quiet_routine",
      emotion: "疲惫、克制",
    },
    {
      beat: "private_shock",
      emotion: "震动、怀疑",
    },
    {
      beat: "external_threat",
      emotion: "恐惧、警觉",
    },
    {
      beat: "mission_acceptance",
      emotion: "决断、压抑的愤怒",
    },
  ],
  scenes: [
    {
      id: "sc-001",
      scene_id: "sc-001",
      scene_number: 1,
      order: 1,
      title: "午夜档案馆",
      int_ext: "内景",
      location: "临港旧城档案馆三层",
      time: "午夜",
      timeOfDay: "午夜",
      scene_description:
        "潮湿的档案馆里，旧风扇缓慢转动。远处海雾压低城市，窗外只有微弱灯光扫过墙面。",
      heading: {
        int_ext: "内景",
        location: "临港旧城档案馆三层",
        time: "午夜",
        atmosphere: "潮湿、空旷、只有一盏孤灯",
      },
      characters: ["林照"],
      characters_present: ["林照"],
      dramatic_purpose: "用普通夜班切入异常卷宗，建立悬疑世界入口。",
      purpose: "用普通夜班切入异常卷宗，建立悬疑世界入口。",
      summary: "林照在夜班中发现雾港沉船案卷宗。",
      action_lines: [
        "潮水拍上档案馆外的石阶，窗框泛着冷白水光。",
        "林照拖开铁柜，灰尘和水汽一起扬起。",
        "她抽出一盒卷宗，封皮上的印章被水泡到只剩半枚。",
      ],
      dialogues: [
        {
          character: "林照",
          line: "一九九七年，雾港沉船案？这盒不是早就封存了吗？",
        },
      ],
      transition: "林照指尖擦过封皮，卷宗夹层松开，切入下一场。",
    },
    {
      id: "sc-002",
      scene_id: "sc-002",
      scene_number: 2,
      order: 2,
      title: "照片夹层",
      int_ext: "内景",
      location: "档案馆阅览桌",
      time: "午夜",
      timeOfDay: "午夜",
      scene_description:
        "台灯冷光压低空间，桌面上铺满潮湿卷宗。一张没有登记号的照片带着水痕滑到灯下。",
      heading: {
        int_ext: "内景",
        location: "档案馆阅览桌",
        time: "午夜",
        atmosphere: "台灯冷光压低空间，照片带着水痕",
      },
      characters: ["林照", "林父"],
      characters_present: ["林照", "林父"],
      dramatic_purpose: "把公共旧案转成主角私人伤口，制造第一次反转。",
      purpose: "把公共旧案转成主角私人伤口，制造第一次反转。",
      summary: "照片显示林照父亲站在失踪渡轮前。",
      action_lines: [
        "年轻的林父站在暴雨码头，身后是官方记录里早已失踪的渡轮。",
        "渡轮船名被海水晕开，只露出模糊的尾字。",
        "林照低头看向自己的手背，月牙形伤疤在冷光里发白。",
      ],
      dialogues: [
        {
          character: "林照",
          line: "爸，你为什么会在这里？",
        },
      ],
      transition: "楼下传来三下敲门声，林照猛地抬头。",
    },
    {
      id: "sc-003",
      scene_id: "sc-003",
      scene_number: 3,
      order: 3,
      title: "门缝里的录音机",
      int_ext: "内景",
      location: "档案馆楼梯间",
      time: "午夜",
      timeOfDay: "午夜",
      scene_description:
        "楼梯间没有开灯，门缝外只露出一线红光。旧式录音机被推到林照脚边，磁带开始转动。",
      heading: {
        int_ext: "内景",
        location: "档案馆楼梯间",
        time: "午夜",
        atmosphere: "黑暗、低频杂音、门外有人但不露面",
      },
      characters: ["林照", "林父录音", "门外来客"],
      characters_present: ["林照", "林父录音", "门外来客"],
      dramatic_purpose: "让外部威胁抵达，确认父亲留下的是行动警告。",
      purpose: "让外部威胁抵达，确认父亲留下的是行动警告。",
      summary: "陌生人留下录音机，父亲声音从磁带中出现。",
      action_lines: [
        "林照关掉台灯，整层档案馆陷入潮湿黑暗。",
        "门外的人没有进来，只把录音机推过门缝。",
        "红色指示灯亮起，磁带转轮缓慢转动。",
      ],
      dialogues: [
        {
          character: "林父录音",
          line: "如果你听见这段录音，说明他们又开始改写那一夜了。",
        },
        {
          character: "林照",
          line: "他们是谁？",
        },
        {
          character: "门外来客",
          line: "你不该打开那一层。",
        },
      ],
      transition: "录音杂音变大，窗外灯塔光扫进来。",
    },
    {
      id: "sc-004",
      scene_id: "sc-004",
      scene_number: 4,
      order: 4,
      title: "灯塔切开海雾",
      int_ext: "内景 / 外景",
      location: "档案馆窗边 / 临港旧城街面",
      time: "深夜",
      timeOfDay: "深夜",
      scene_description:
        "海雾压住整座旧城，灯塔光束像刀一样切过街面，也切过林照手中的照片。",
      heading: {
        int_ext: "内景 / 外景",
        location: "档案馆窗边 / 临港旧城街面",
        time: "深夜",
        atmosphere: "海雾压城，灯塔光像刀一样移动",
      },
      characters: ["林照"],
      characters_present: ["林照"],
      dramatic_purpose: "完成主角使命确认，并给下一集留下追查钩子。",
      purpose: "完成主角使命确认，并给下一集留下追查钩子。",
      summary: "林照意识到整座城市的记忆正在被改写。",
      action_lines: [
        "照片里的渡轮忽然多出一行模糊编号，像刚被重新写上去。",
        "林照把照片塞进口袋，回头看向门外的黑暗。",
        "她没有逃走，而是转身走向楼梯。",
      ],
      dialogues: [
        {
          character: "林照",
          line: "这不是旧案，这是还没结束的案子。",
        },
      ],
      transition: "林照走下楼梯，灯塔光在她身后熄灭。",
    },
  ],
};

export const agent4_reviewer = {
  summary:
    "本报告由 AI 导演审查官基于专业剧本评估标准生成，用于模拟导演、编剧、制片视角对改编剧本进行审查。当前版本保留了原文的悬疑湿冷气质，场景目标清晰，父亲照片与录音构成有效双重钩子；主要风险是世界观规则仍需更具体，主角主动选择可进一步提前。",
  reviewCriteria: [
    "原著忠实度：核心事件、人物关系、主题是否保留。",
    "戏剧冲突：每场是否有目标、阻碍、反转。",
    "人物一致性：角色动机、语言、行为是否稳定。",
    "镜头可拍性：场景是否能被实际拍摄，动作是否清楚。",
    "节奏控制：信息释放、悬念、情绪峰值是否合理。",
    "情感传达：人物关系是否打动观众。",
    "商业短剧潜力：开头钩子、结尾钩子、爽点/悬念是否成立。",
  ],
  scores: {
    fidelity_score: 88,
    dramatic_conflict_score: 85,
    character_score: 86,
    filmability_score: 88,
    pacing_score: 84,
    emotion_score: 90,
    commercial_score: 82,
    logic_score: 84,
  },
  scoreDetails: {
    fidelity_score: {
      label: "原著忠实度",
      score: 88,
      reason: "沉船案、父亲照片、录音警告和城市记忆主题均被保留，原文的潮湿悬疑气质没有丢失。",
      issue: "部分世界观规则从文学氛围转成剧本动作后仍偏抽象。",
      suggestion: "在第一场加入档案编号自动变化，让记忆篡改机制更早具象化。",
    },
    dramatic_conflict_score: {
      label: "戏剧冲突",
      score: 85,
      reason: "每场都有明确目标与阻碍：找卷宗、确认照片、面对门外威胁、选择继续追查。",
      issue: "第一场外部阻力稍弱，前三十秒钩子还可以更锋利。",
      suggestion: "让卷宗在林照眼前改变编号，迫使她立刻做出反应。",
    },
    character_score: {
      label: "人物一致性",
      score: 86,
      reason: "林照的谨慎、压抑和追查欲望稳定，父亲的录音延续了缺席但有影响力的角色功能。",
      issue: "门外来客仍偏符号化，缺少一句能体现其立场的独特台词。",
      suggestion: "给门外来客增加更具体的威胁，例如“你母亲已经忘了他”。",
    },
    filmability_score: {
      label: "镜头可拍性",
      score: 88,
      reason: "场景集中在档案馆、楼梯间和窗边，道具清晰，动作可执行，制作成本可控。",
      issue: "城市记忆改写仍主要靠概念表达，视觉证据可以更强。",
      suggestion: "用照片编号、档案页字迹、录音杂音三个可拍元素呈现规则。",
    },
    pacing_score: {
      label: "节奏控制",
      score: 84,
      reason: "四场结构递进清晰，信息释放从卷宗到照片再到录音，结尾留钩。",
      issue: "中段照片与录音之间的情绪停顿略短。",
      suggestion: "在第二场结尾增加林照短暂否认或试图销毁照片的动作。",
    },
    emotion_score: {
      label: "情感传达",
      score: 90,
      reason: "父女线与月牙伤疤形成有效情感锚点，林照从怀疑到决断的变化成立。",
      issue: "母亲或旧友尚未进入本集，家庭情感横向关系不足。",
      suggestion: "后续集加入旧友或母亲，补足林照追查真相的现实代价。",
    },
    commercial_score: {
      label: "商业短剧潜力",
      score: 82,
      reason: "开头孤灯档案馆和结尾“旧案未结束”具备追看钩子，悬疑短剧方向清晰。",
      issue: "爽点偏克制，更偏气质悬疑，爆点密度还可以提高。",
      suggestion: "在第三场增加门外来客说出林照私人秘密，提升即时刺激。",
    },
  },
  issues: [
    "世界观规则尚未具象化，后续需要补足观众理解成本。",
    "主角主动性在前半段偏弱，需要尽快让她做出不可逆选择。",
    "门外来客的压力足够，但威胁机制还可以更具体。",
  ],
  suggestions: [
    "在第一场加入档案编号自动变化的细节，提前埋设记忆篡改机制。",
    "让门外来客留下一句更具体的威胁，增强下一集追看动力。",
    "保留父亲是否可信的摇摆，不要过早解释他的阵营。",
  ],
  sceneReviews: [
    {
      sceneId: "sc-001",
      note: "开场氛围明确，但可以增加一个更强的视觉异常作为前三秒钩子。",
    },
    {
      sceneId: "sc-002",
      note: "父亲照片与伤疤对照有效，是本集最强情感信息点。",
    },
    {
      sceneId: "sc-003",
      note: "录音机推进节奏好，门外来客可以保留身份模糊。",
    },
    {
      sceneId: "sc-004",
      note: "结尾使命成立，建议下一集立刻展示记忆被改写的具体代价。",
    },
  ],
  riskFlags: [
    "世界观规则尚未具象化，后续需要补足观众理解成本。",
    "主角主动性在前半段偏弱，需要尽快让她做出不可逆选择。",
  ],
  revisionSuggestions: [
    "在第一场加入档案编号自动变化的细节，提前埋设记忆篡改机制。",
    "让门外来客留下一句更具体的威胁，增强下一集追看动力。",
    "保留父亲是否可信的摇摆，不要过早解释他的阵营。",
  ],
};

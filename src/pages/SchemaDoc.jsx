import { useStory } from "../context/StoryContext.jsx";

const fallbackYaml = `title: "潮汐归档人"
source_type: "novel"
chapter_count: 1
characters:
  - id: "char_001"
    name: "林默"
    role: "主角"
    description: "年轻档案员，谨慎敏感，正在追查被潮汐抹去的记忆。"
chapters:
  - chapter_id: "chapter_001"
    title: "第一章 档案馆夜谈"
    summary: "林默在档案馆发现异常线索。"
    scenes:
      - scene_id: "scene_001"
        scene_title: "第1场 档案馆 / 夜晚 / 内景"
        location: "档案馆"
        time: "夜晚"
        interior_exterior: "内景"
        characters:
          - "林默"
        action: "林默推开档案馆的木门，昏黄灯光从门缝里漏出。"
        dialogues:
          - character: "林默"
            emotion: "低声"
            line: "这里果然还有人来过。"
        purpose: "建立悬疑氛围，引出核心线索。"`;

const topLevelFields = [
  ["title", "作品标题或改编剧本标题。"],
  ["source_type", "原始内容类型，当前用于标记小说来源。"],
  ["chapter_count", "识别或自动拆分出的章节数量。"],
  ["characters", "人物表，记录主要角色的身份、功能和描述。"],
  ["chapters", "章节数组，保留原著章节结构并承载对应场次。"],
  ["scenes", "每章内的剧本场次，是编辑、拍摄和审查的核心单元。"],
];

const characterFields = [
  ["id", "稳定人物 ID，便于后续跨章节追踪。"],
  ["name", "人物名称。"],
  ["role", "人物身份或叙事功能，例如主角、反派、导师、见证者。"],
  ["description", "人物简述，帮助编剧理解角色状态和创作方向。"],
];

const sceneFields = [
  ["scene_id", "场次 ID，例如 scene_001。"],
  ["scene_title", "场次标题，例如 第1场 档案馆 / 夜晚 / 内景。"],
  ["location", "场景地点。"],
  ["time", "场景时间。"],
  ["interior_exterior", "内景或外景。"],
  ["characters", "本场出现人物。"],
  ["action", "动作与画面描写。"],
  ["dialogues", "对白列表，包含说话人物、情绪和台词。"],
  ["purpose", "本场戏剧目的，例如建立悬疑、推动关系、制造反转。"],
];

const reasons = [
  "保留章节结构，方便处理 3 个章节以上的长文本小说。",
  "把动作、对白、人物和场次目的分离，让剧本初稿可编辑、可审查、可继续打磨。",
  "YAML 比 JSON 更适合创作者直接阅读和修改，也更适合承载长篇剧本文档。",
  "结构化字段可继续转为分镜、拍摄计划、导演审查、平台适配和短剧生产数据。",
];

function FieldGrid({ title, fields }) {
  return (
    <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {fields.map(([name, description]) => (
          <div key={name} className="rounded-md border border-story-border bg-story-bg/80 p-4">
            <p className="font-mono text-sm text-story-gold">{name}</p>
            <p className="mt-2 text-sm leading-6 text-story-muted">{description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function SchemaDoc() {
  const { state } = useStory();
  const yamlExample = state.generatedYaml || fallbackYaml;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-story-border bg-story-card/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <p className="text-sm uppercase tracking-wide text-story-muted">YAML 结构文档</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">面向小说改编的结构化剧本 Schema</h1>
        <p className="mt-4 max-w-4xl leading-7 text-story-muted">
          StoryFlow AI 使用 YAML 保存小说到剧本的改编结果。它既能让创作者直接阅读和编辑，也能为后续导演审查、分镜生成、拍摄计划和平台适配提供稳定的数据结构。
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">Schema 设计目标</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-story-muted">
            <li>支持 3 个章节以上小说文本的章节级结构化转换。</li>
            <li>输出可编辑、可复制、可下载的剧本 YAML 初稿。</li>
            <li>保留章节、人物、场次、动作、对白和戏剧目的。</li>
            <li>为后续分镜、导演审查、平台适配和多版本打磨预留结构。</li>
          </ul>
        </article>

        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">为什么使用 YAML</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-story-muted">
            <li>可读性强，适合创作者直接检查和修改。</li>
            <li>比 JSON 更适合长篇剧本文档和人工协作。</li>
            <li>层级清晰，能自然表达章节、场次和对白结构。</li>
            <li>方便转换为分镜、拍摄计划和审查报告。</li>
          </ul>
        </article>
      </section>

      <FieldGrid title="顶层字段说明" fields={topLevelFields} />

      <section className="grid gap-6 lg:grid-cols-2">
        <FieldGrid title="characters 字段说明" fields={characterFields} />
        <FieldGrid title="scenes 字段说明" fields={sceneFields} />
      </section>

      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <h2 className="font-serif text-xl font-semibold">chapters 与 dialogues 设计说明</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-story-border bg-story-bg/80 p-4">
            <h3 className="font-serif text-lg font-semibold">chapters</h3>
            <p className="mt-2 text-sm leading-6 text-story-muted">
              保留章节结构可以对应原著章节，方便长文本分段处理，也方便作者逐章检查、打磨和重写。每个章节包含 chapter_id、title、summary 和 scenes。
            </p>
          </div>
          <div className="rounded-md border border-story-border bg-story-bg/80 p-4">
            <h3 className="font-serif text-lg font-semibold">dialogues</h3>
            <p className="mt-2 text-sm leading-6 text-story-muted">
              对白包含 character、emotion、line。这样可以同时服务演员表演、配音设计、情绪曲线和后续导演审查。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">示例 YAML</h2>
          <pre className="mt-4 max-h-[620px] overflow-auto rounded-md border border-story-border bg-story-bg p-4 text-xs leading-6 text-story-text">
            {yamlExample}
          </pre>
        </article>

        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">设计原因总结</h2>
          <ul className="mt-4 space-y-3">
            {reasons.map((item) => (
              <li
                key={item}
                className="rounded-md border border-story-border px-4 py-3 text-sm leading-6 text-story-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

export default SchemaDoc;

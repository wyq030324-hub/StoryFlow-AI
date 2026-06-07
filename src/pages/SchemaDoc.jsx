import { useStory } from "../context/StoryContext.jsx";

const fallbackYaml = `screenplay:
  title: "潮汐归档人"
  episode: "EP01"
  format: "short_drama_screenplay"
chapter_source: "潮汐归档人 / 第一章：午夜卷宗"
theme: "个体记忆对抗被抹除的公共真相"
emotional_arc:
  - beat: "平静日常"
    emotion: "疲惫、克制"
scenes:
  - scene_id: "第一场"
    heading:
      int_ext: "内景"
      location: "临港旧城档案馆三楼"
      time: "午夜"
      atmosphere: "潮湿、空旷、只剩一盏孤灯"
    characters_present:
      - "林照"
    action_lines:
      - "潮水拍上档案馆外的石阶。"
    dialogues:
      - character: "林照"
        line: "这盒不是早就封存了吗？"
    transition: "卷宗夹层松开。"
review:
  issues:
    - "世界观规则需要更具体。"
  suggestions:
    - "加入档案编号自动变化的细节。"
scores:
  fidelity_score: 88
  character_score: 84
  emotion_score: 90
  logic_score: 82
`;

const fields = [
  ["screenplay", "剧本元信息，包括标题、集数和目标格式。"],
  ["chapter_source", "本次改编对应的原著章节或片段来源。"],
  ["theme", "本章核心主题，供审查、分镜和后续生成统一对齐。"],
  ["emotional_arc", "情绪节拍列表，用来描述观众体验的递进。"],
  ["scenes", "剧本场景数组，是短剧生产的主要结构单元。"],
  ["scene_id", "稳定场次标识，用于页面联动、审查定位和后续分镜引用。"],
  ["heading", "场景标题信息，包含内外景、地点、时间和氛围。"],
  ["characters_present", "本场出现角色，便于台词、调度和配音准备。"],
  ["action_lines", "动作与画面描写，面向导演和分镜。"],
  ["dialogues", "台词列表，包含角色和具体台词。"],
  ["transition", "场景转场提示，帮助控制节奏。"],
  ["review", "导演审查结论，包括问题、风险和修正建议。"],
  ["scores", "结构化评分，方便多版本比较。"],
];

const extensions = [
  "分镜生成：将场景拆成镜头列表、景别和运镜说明。",
  "配音准备：基于角色与台词生成声音任务。",
  "短剧制作：把场景、动作线和台词交给短剧生产流程。",
  "视频生成：为每个场景或镜头生成图像提示词和运动提示词。",
  "多模型评审：让不同模型分别输出审查报告，再做交叉对比。",
];

function SchemaDoc() {
  const { state } = useStory();
  const yamlExample = state.generatedYaml || fallbackYaml;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-story-border bg-story-card/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <p className="text-sm uppercase tracking-wide text-story-muted">
          YAML结构文档
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">
          面向剧本生产的结构化交付
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-story-muted">
          这套 YAML 结构把原著来源、剧本场景、导演审查和评分放在同一份可读文档中。作者可以检查，团队可以协作，后续生产系统也可以继续读取。
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">YAML结构</h2>
          <pre className="mt-4 overflow-auto rounded-md border border-story-border bg-story-bg p-4 text-xs leading-6 text-story-text">
            {`screenplay:
  title:
  episode:
  format:
chapter_source:
theme:
emotional_arc:
  - beat:
    emotion:
scenes:
  - scene_id:
    heading:
      int_ext:
      location:
      time:
      atmosphere:
    purpose:
    characters_present:
    action_lines:
    dialogues:
      - character:
        line:
    transition:
review:
  summary:
  issues:
  suggestions:
scores:
  fidelity_score:
  character_score:
  emotion_score:
  logic_score:`}
          </pre>
        </article>

        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">设计理念</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-story-muted">
            <li>保留章节来源，让每一次改编都有可追溯依据。</li>
            <li>把场景作为稳定单元，支持对照、审查和导出。</li>
            <li>分离动作线与台词，方便导演、分镜和配音协作。</li>
            <li>把审查与评分贴近剧本，便于团队讨论修改方向。</li>
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <h2 className="font-serif text-xl font-semibold">字段说明</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fields.map(([name, description]) => (
            <div
              key={name}
              className="rounded-md border border-story-border bg-story-bg/80 p-4"
            >
              <p className="font-mono text-sm text-story-gold">{name}</p>
              <p className="mt-2 text-sm leading-6 text-story-muted">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">示例输出</h2>
          <pre className="mt-4 max-h-[560px] overflow-auto rounded-md border border-story-border bg-story-bg p-4 text-xs leading-6 text-story-text">
            {yamlExample}
          </pre>
        </article>

        <article className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <h2 className="font-serif text-xl font-semibold">扩展方向</h2>
          <ul className="mt-4 space-y-3">
            {extensions.map((item) => (
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

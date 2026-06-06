import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useStory } from "../context/StoryContext.jsx";

const fallbackScoreItems = [
  ["忠实度", "88"],
  ["人物一致性", "84"],
  ["情感还原度", "90"],
  ["逻辑完整度", "82"],
];

function useShowcaseParallax(ref) {
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    let frame = 0;

    function handlePointerMove(event) {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        element.style.setProperty("--mx", x.toFixed(4));
        element.style.setProperty("--my", y.toFixed(4));
      });
    }

    function resetPointer() {
      element.style.setProperty("--mx", "0");
      element.style.setProperty("--my", "0");
    }

    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerleave", resetPointer);

    return () => {
      window.cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerleave", resetPointer);
    };
  }, [ref]);
}

function SectionLabel({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm uppercase tracking-[0.28em] text-story-gold">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-serif text-4xl font-semibold md:text-6xl">
        {title}
      </h2>
      <p className="mt-5 max-w-xl text-base leading-8 text-story-muted md:text-lg">
        {description}
      </p>
    </div>
  );
}

function Showcase() {
  const { state } = useStory();
  const pageRef = useRef(null);
  const scores = state.reviewResult?.scores;
  const scoreItems = scores
    ? [
        ["忠实度", scores.fidelity_score],
        ["人物一致性", scores.character_score],
        ["情感还原度", scores.emotion_score],
        ["逻辑完整度", scores.logic_score],
      ]
    : fallbackScoreItems;

  useShowcaseParallax(pageRef);

  return (
    <div ref={pageRef} className="showcase-page h-screen overflow-y-auto">
      <section className="showcase-slice showcase-hero">
        <div className="showcase-grid mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-[0.95fr_1.05fr] md:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-story-gold">
              AI 剧本改编工作台
            </p>
            <h1 className="mt-5 font-serif text-5xl font-semibold md:text-7xl">
              StoryFlow AI
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-story-muted">
              让小说以导演的语言重生
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/"
                className="rounded-full border border-story-gold/70 bg-story-gold px-6 py-3 text-sm font-semibold text-story-bg shadow-[0_18px_44px_rgba(201,169,110,0.22)] transition hover:-translate-y-0.5 hover:bg-story-text"
              >
                进入工作台
              </Link>
              <p className="text-sm text-story-muted">
                回到工作台加载示例小说，即可开始完整演示。
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-story-muted">
              <span className="rounded-full border border-story-border bg-story-card/70 px-4 py-2">
                原著解析
              </span>
              <span className="rounded-full border border-story-border bg-story-card/70 px-4 py-2">
                场景级生成
              </span>
              <span className="rounded-full border border-story-border bg-story-card/70 px-4 py-2">
                导演审查
              </span>
              <span className="rounded-full border border-story-border bg-story-card/70 px-4 py-2">
                YAML交付
              </span>
            </div>
          </div>

          <div className="showcase-tilt relative min-h-[420px]">
            <div className="showcase-orbit-card left-4 top-8">
              <p className="text-xs text-story-muted">小说输入</p>
              <h3 className="mt-2 font-serif text-2xl">潮汐归档人</h3>
              <p className="mt-3 text-sm leading-6 text-story-muted">
                午夜档案馆、失踪渡轮、父亲录音。
              </p>
            </div>
            <div className="showcase-orbit-card right-0 top-28 delay-1">
              <p className="text-xs text-story-muted">导演语言</p>
              <h3 className="mt-2 font-serif text-2xl">INT. 档案馆 / 午夜</h3>
              <p className="mt-3 text-sm leading-6 text-story-muted">
                潮水拍上石阶，灯塔光切过照片。
              </p>
            </div>
            <div className="showcase-orbit-card bottom-10 left-20 delay-2">
              <p className="text-xs text-story-muted">结构化导出</p>
              <h3 className="mt-2 font-serif text-2xl">scene_id: sc-001</h3>
              <p className="mt-3 text-sm leading-6 text-story-muted">
                可进入分镜、配音与短剧生成链路。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-slice">
        <div className="showcase-grid mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-2 md:px-10">
          <SectionLabel
            eyebrow="原著分析师"
            title="从文字中提取可拍信息"
            description="从小说文本中提取人物、场景、情绪与关键细节，把文学叙事拆成可被导演和编剧继续处理的结构。"
          />
          <div className="showcase-analysis-core">
            {["人物动机", "场景线索", "情绪节拍", "关键道具", "主题冲突"].map(
              (item, index) => (
                <span
                  key={item}
                  className={`showcase-fragment fragment-${index + 1}`}
                >
                  {item}
                </span>
              ),
            )}
            <div className="showcase-core-card">
              <p className="text-sm text-story-muted">分析核心</p>
              <h3 className="mt-2 font-serif text-3xl">原著结构化</h3>
              <p className="mt-4 text-sm leading-6 text-story-muted">
                角色、地点、冲突、情绪被吸入同一个叙事坐标。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-slice">
        <div className="showcase-grid mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-10">
          <SectionLabel
            eyebrow="剧本编剧"
            title="小说段落变成场景"
            description="逐场景生成专业剧本，减少剧情压缩与人物偏移，让每一段原文都能找到对应的导演动作和台词位置。"
          />
          <div className="showcase-scene-transform">
            <div className="rounded-xl border border-story-border bg-story-card/70 p-5 text-sm leading-7 text-story-muted">
              林照把最后一盒水渍卷宗从铁柜里抱出来，封皮上只剩半枚褪色印章。
            </div>
            <div className="showcase-transform-line" />
            <div className="grid gap-3">
              {["sc-001 午夜档案馆", "sc-002 照片夹层", "sc-003 门缝里的录音机"].map(
                (scene) => (
                  <div
                    key={scene}
                    className="rounded-xl border border-story-gold/50 bg-story-card/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)]"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-story-gold">
                      场景
                    </p>
                    <h3 className="mt-2 font-serif text-2xl">{scene}</h3>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-slice">
        <div className="showcase-grid mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-[1fr_1fr] md:px-10">
          <SectionLabel
            eyebrow="导演审查官"
            title="把生成结果交给导演视角"
            description="评估忠实度、人物一致性、情感还原度和逻辑完整度，让剧本不仅能生成，也能被解释、被审查、被修正。"
          />
          <div className="showcase-review-orbit">
            <div className="showcase-review-center">
              <p className="text-sm text-story-muted">AI审查报告</p>
              <h3 className="mt-2 font-serif text-3xl">可拍性通过</h3>
              <p className="mt-4 text-sm leading-6 text-story-muted">
                双重反转成立，下一集需补足世界观规则。
              </p>
            </div>
            {scoreItems.map(([label, score], index) => (
              <div key={label} className={`showcase-score score-${index + 1}`}>
                <span>{label}</span>
                <strong>{score}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="showcase-slice">
        <div className="showcase-grid mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-10">
          <SectionLabel
            eyebrow="YAML导出官"
            title="把创作结果变成生产接口"
            description="将剧本结果导出为结构化 YAML，便于后续分镜、配音、短剧生成和多模型评审继续接入。"
          />
          <div className="showcase-code-panel">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-story-gold" />
              <span className="h-2.5 w-2.5 rounded-full bg-story-success" />
              <span className="h-2.5 w-2.5 rounded-full bg-story-border" />
            </div>
            <pre className="overflow-hidden text-xs leading-6 text-story-text md:text-sm">
{`screenplay:
  title: "潮汐归档人"
scenes:
  - scene_id: "sc-001"
    heading:
      location: "临港旧城档案馆"
    action_lines:
      - "潮水拍上石阶。"
review:
  scores:
    fidelity_score: 88`}
            </pre>
            <div className="showcase-gold-wire wire-1" />
            <div className="showcase-gold-wire wire-2" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Showcase;

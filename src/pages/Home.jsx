import { ArrowDown, ArrowRight, Bot, Film, Wand2 } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import useRevealGroup from "../hooks/useRevealGroup.js";
import useRevealOnScroll from "../hooks/useRevealOnScroll.js";

const capabilityCards = [
  {
    title: "小说转剧本",
    description: "多 Agent 协作，将原著拆解为专业场景剧本。",
    icon: Film,
  },
  {
    title: "多 Agent 审查",
    description: "导演视角评估忠实度、节奏与人物一致性。",
    icon: Bot,
  },
  {
    title: "创意重构",
    description: "重塑故事风格，提供多维度导演创作方向。",
    icon: Wand2,
  },
];

function Home() {
  const heroGroupRef = useRevealGroup(120);
  const capabilityRef = useRef(null);
  const capabilityTitleRef = useRevealOnScroll();
  const capabilityGroupRef = useRevealGroup(90);

  function scrollToCapabilities() {
    capabilityRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="space-y-10 pb-12">
      <section
        className="animate-shader-flow relative overflow-hidden rounded-2xl border border-story-border px-5 py-16 shadow-[0_30px_100px_rgba(0,0,0,0.34)] sm:px-8 md:px-10 lg:px-14 lg:py-24"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 18%, rgba(201,169,110,0.2), transparent 26rem), radial-gradient(circle at 78% 44%, rgba(201,169,110,0.12), transparent 24rem), linear-gradient(135deg, rgba(14,12,10,0.99), rgba(29,24,19,0.94), rgba(14,12,10,0.99))",
        }}
      >
        <div className="absolute left-[-18%] top-[-24%] h-80 w-80 rounded-full bg-story-gold/10 blur-3xl" />
        <div className="absolute bottom-[-28%] right-[-10%] h-96 w-96 rounded-full bg-story-gold/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-story-gold/60 to-transparent" />

        <div ref={heroGroupRef} className="relative mx-auto max-w-4xl text-center">
          <p className="reveal-child inline-flex items-center rounded-full border border-story-border bg-story-bg/75 px-3 py-1 text-xs text-story-muted">
            AI 编剧工作台 · AI 创作伙伴
          </p>
          <h1 className="reveal-child mt-7 font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl">
            StoryFlow AI
          </h1>
          <p className="reveal-child mt-5 font-serif text-xl text-story-gold sm:text-2xl">
            让小说以导演的语言重生
          </p>
          <p className="reveal-child mx-auto mt-5 max-w-2xl text-sm leading-7 text-story-muted sm:text-base sm:leading-8">
            一个面向编剧、导演与内容创作者的 AI 剧本工作台，将小说转化为可拍摄、可审查、可再创造的专业剧本。
          </p>
          <div className="reveal-child mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/workspace"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-story-gold px-6 py-3 text-sm font-semibold text-story-bg shadow-[0_0_34px_rgba(201,169,110,0.28),0_18px_44px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:bg-story-text hover:shadow-[0_0_44px_rgba(201,169,110,0.36)]"
            >
              进入工作台
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={scrollToCapabilities}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-story-border bg-story-bg/70 px-6 py-3 text-sm text-story-text transition hover:-translate-y-1 hover:border-story-gold hover:text-story-gold"
            >
              了解产品能力
              <ArrowDown size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section ref={capabilityRef} className="scroll-mt-8">
        <div ref={capabilityTitleRef} className="reveal-item text-center">
          <p className="text-sm text-story-gold">产品定位</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
            把创作流程收束成清晰的专业工作台
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-story-muted">
            不堆叠功能噪音，只围绕“理解原著、生成剧本、审查改编、再创造”组织核心能力。
          </p>
        </div>

        <div
          ref={capabilityGroupRef}
          className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          {capabilityCards.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="reveal-child animate-bento-lift rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] hover:border-story-gold/70"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-story-gold/40 bg-story-bg text-story-gold">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-semibold">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-story-muted">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

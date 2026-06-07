import {
  BookOpen,
  FileCode2,
  GitCompare,
  Home,
  ScrollText,
  UsersRound,
  Wand2,
} from "lucide-react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import TopBar from "./TopBar.jsx";

const navItems = [
  {
    path: "/",
    label: "官方首页",
    description: "了解产品定位与核心能力",
    icon: Home,
  },
  {
    path: "/workspace",
    label: "工作台",
    description: "输入小说并生成影视剧本",
    icon: BookOpen,
  },
  {
    path: "/characters",
    label: "人物感情线",
    description: "梳理人物关系与情感线",
    icon: UsersRound,
    group: "core",
  },
  {
    path: "/rewrite",
    label: "创意重构",
    description: "重塑故事风格和方向",
    icon: Wand2,
  },
  {
    path: "/comparison",
    label: "原著对照",
    description: "对照原著内容与改编剧本",
    icon: GitCompare,
  },
  {
    path: "/review",
    label: "导演审查",
    description: "评估剧本质量与修改方向",
    icon: ScrollText,
  },
  {
    path: "/schema",
    label: "YAML结构",
    description: "查看结构化导出格式",
    icon: FileCode2,
    group: "delivery",
  },
];

const primaryNavItems = navItems.filter((item) => item.group !== "delivery");
const deliveryNavItems = navItems.filter((item) => item.group === "delivery");

function DeckLink({ item }) {
  const { path, label, description, icon: Icon } = item;

  return (
    <NavLink
      to={path}
      end={path === "/"}
      className={({ isActive }) =>
        `story-deck-card relative block rounded-xl border border-story-gold/20 bg-story-card/90 px-4 py-3 shadow-[0_16px_46px_rgba(0,0,0,0.24)] transition-all duration-300 ease-out ${
          isActive
            ? "story-deck-card-active story-deck-glow border-story-gold/70 bg-story-card text-story-text"
            : "text-story-muted"
        }`
      }
    >
      {({ isActive }) => (
        <span className="relative z-10 flex items-center gap-3">
          {isActive ? (
            <span
              className="absolute -left-4 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-full bg-story-gold shadow-[0_0_18px_rgba(201,169,110,0.55)]"
              aria-hidden="true"
            />
          ) : null}
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-story-border bg-story-bg/85 text-story-gold">
            <Icon size={18} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="font-serif text-lg font-semibold text-story-text">
                {label}
              </span>
              {isActive ? (
                <span className="rounded-full border border-story-gold/50 px-2 py-0.5 text-[10px] text-story-gold">
                  当前模块
                </span>
              ) : null}
            </span>
            <span className="mt-1 block text-xs leading-5 text-story-muted">
              {description}
            </span>
          </span>
        </span>
      )}
    </NavLink>
  );
}

function AppShell({ children }) {
  useEffect(() => {
    function handlePointerMove(event) {
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    }

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen text-story-text">
      <div className="app-gold-dust" aria-hidden="true" />
      <div className="mouse-glow" aria-hidden="true" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[320px] flex-col border-r border-story-border bg-story-bg/95 px-5 py-6 shadow-[18px_0_60px_rgba(0,0,0,0.22)] backdrop-blur md:flex">
        <NavLink to="/" className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-story-gold/50 bg-story-card font-serif text-xl text-story-gold shadow-[0_0_28px_rgba(201,169,110,0.18)]">
            S
          </span>
          <span>
            <span className="block font-serif text-2xl font-semibold">
              Story Deck
            </span>
            <span className="mt-1 block text-sm text-story-text">
              故事卡组
            </span>
            <span className="mt-1 block text-xs leading-5 text-story-muted">
              选择创作模块，推进你的剧本项目
            </span>
          </span>
        </NavLink>

        <nav className="mt-7 space-y-3 text-sm text-story-muted">
          {primaryNavItems.map((item) => (
            <DeckLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="mt-6 border-t border-story-border pt-4">
          <p className="mb-3 px-1 text-xs uppercase tracking-[0.18em] text-story-muted">
            结构化交付
          </p>
          <nav className="space-y-3 text-sm text-story-muted">
            {deliveryNavItems.map((item) => (
              <DeckLink key={item.path} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      <TopBar navItems={navItems} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:ml-[320px] md:px-5 md:py-8">
        {children}
      </main>
    </div>
  );
}

export default AppShell;

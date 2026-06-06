import { NavLink } from "react-router-dom";

function TopBar({ navItems }) {
  return (
    <header className="sticky top-0 z-30 border-b border-story-border bg-story-bg/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-story-gold/50 bg-story-card font-serif text-lg text-story-gold shadow-[0_0_28px_rgba(201,169,110,0.18)]">
            S
          </span>
          <span>
            <span className="block font-serif text-lg font-semibold">
              Story Deck
            </span>
            <span className="block text-xs text-story-muted">
              故事卡组
            </span>
          </span>
        </NavLink>
      </div>

      <nav
        className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 text-sm text-story-muted"
        aria-label="移动端故事卡组导航"
      >
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 transition-all duration-200 ${
                isActive
                  ? "border-story-gold bg-story-gold/10 text-story-text shadow-[0_0_24px_rgba(201,169,110,0.16)]"
                  : "border-story-border bg-story-card/70 hover:border-story-gold hover:text-story-text"
              }`
            }
          >
            <Icon size={15} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default TopBar;

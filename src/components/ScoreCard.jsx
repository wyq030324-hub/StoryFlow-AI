function ScoreCard({ label, value, caption }) {
  const score = Number(value) || 0;

  return (
    <article className="rounded-lg border border-story-border bg-story-card/95 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-story-muted">{label}</p>
          <p className="mt-2 font-serif text-4xl font-semibold text-story-text">
            {score}
          </p>
        </div>
        <span className="rounded-md border border-story-border px-2 py-1 text-xs text-story-muted">
          /100
        </span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-story-bg">
        <div
          className="h-full rounded-full bg-story-gold"
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>
      {caption ? (
        <p className="mt-4 text-sm leading-6 text-story-muted">{caption}</p>
      ) : null}
    </article>
  );
}

export default ScoreCard;

/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "serif"],
      },
      colors: {
        "story-bg": "var(--bg-primary)",
        "story-card": "var(--bg-card)",
        "story-border": "var(--border)",
        "story-gold": "var(--accent-gold)",
        "story-text": "var(--text-primary)",
        "story-muted": "var(--text-secondary)",
        "story-success": "var(--success)",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "var(--forest, #14421a)",
          deep: "var(--forest-deep, #0d2e11)",
          soft: "var(--forest-soft, #f0fdf4)",
          light: "#2d6a35",
        },
        earth: {
          DEFAULT: "#5c3a21",
          dark: "#3d2616",
          light: "#8a5833",
          soft: "#f9f5f1",
        },
        accent: {
          DEFAULT: "var(--accent, #f5a623)",
          hover: "#e09315",
          soft: "#fffbeb",
        },
        paper: "var(--paper, #ffffff)",
        bg: "var(--bg, #fdfbf7)",
        ink: {
          DEFAULT: "var(--ink, #1f2937)",
          soft: "var(--ink-soft, #6b7280)",
          muted: "var(--ink-muted, #9ca3af)",
        },
        line: "var(--line, #e5e7eb)",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-bengali-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        bengali: ["var(--font-body)", "sans-serif"],
        bengaliDisplay: ["var(--font-bengali-display)", "var(--font-display)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        premium: "0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px rgba(0, 0, 0, 0.05)",
        floating: "0 20px 40px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;

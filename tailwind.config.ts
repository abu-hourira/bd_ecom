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
          DEFAULT: "var(--forest, #843A02)",
          deep: "var(--forest-deep, #1F0E03)",
          soft: "var(--forest-soft, #FBF4EA)",
          light: "var(--forest-light, #A34E08)",
          vibrant: "#C25E0A",
        },
        earth: {
          DEFAULT: "#843A02",
          dark: "#1F0E03",
          light: "#A34E08",
          soft: "#FBF4EA",
        },
        accent: {
          DEFAULT: "var(--accent, #D97706)",
          hover: "#B45309",
          soft: "#FEF3C7",
          gold: "#F59E0B",
          amber: "#D97706",
        },
        paper: "var(--paper, #FFFFFF)",
        bg: "var(--bg, #FAF7F2)",
        ink: {
          DEFAULT: "var(--ink, #1C130D)",
          soft: "var(--ink-soft, #4A3E37)",
          muted: "var(--ink-muted, #948A83)",
        },
        line: "var(--line, #E8E0D5)",
      },
      fontFamily: {
        display: ["var(--font-display)", "'Baloo Da 2'", "'Noto Serif Bengali'", "serif"],
        body: ["var(--font-body)", "'Hind Siliguri'", "'Plus Jakarta Sans'", "sans-serif"],
        bengali: ["var(--font-body)", "'Hind Siliguri'", "sans-serif"],
        bengaliDisplay: ["var(--font-bengali-display)", "'Baloo Da 2'", "'Noto Serif Bengali'", "serif"],
        mono: ["var(--font-mono)", "'Space Mono'", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        premium: "0 10px 30px -10px rgba(132, 58, 2, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        card: "0 2px 14px rgba(132, 58, 2, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 18px 38px -8px rgba(132, 58, 2, 0.16), 0 6px 14px rgba(0, 0, 0, 0.04)",
        floating: "0 20px 45px rgba(132, 58, 2, 0.2)",
        glow: "0 0 20px rgba(217, 119, 6, 0.35)",
        "forest-glow": "0 4px 20px rgba(132, 58, 2, 0.28)",
        "honey-glow": "0 4px 20px rgba(217, 119, 6, 0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "pulse-subtle": "pulseSubtle 2.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

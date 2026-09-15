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
          DEFAULT: "var(--forest, #0F4A24)",
          deep: "var(--forest-deep, #092C15)",
          soft: "var(--forest-soft, #ECFDF5)",
          light: "#1B6334",
          vibrant: "#107C41",
        },
        earth: {
          DEFAULT: "#5C3A21",
          dark: "#3B2414",
          light: "#8B572A",
          soft: "#F9F5F0",
        },
        accent: {
          DEFAULT: "var(--accent, #E69A19)",
          hover: "#C9820E",
          soft: "#FFFBEB",
          gold: "#F59E0B",
        },
        paper: "var(--paper, #FFFFFF)",
        bg: "var(--bg, #FBFBF9)",
        ink: {
          DEFAULT: "var(--ink, #111827)",
          soft: "var(--ink-soft, #4B5563)",
          muted: "var(--ink-muted, #9CA3AF)",
        },
        line: "var(--line, #E5E7EB)",
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
        premium: "0 10px 30px -10px rgba(15, 74, 36, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        card: "0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 16px 36px -8px rgba(15, 74, 36, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)",
        floating: "0 20px 40px rgba(15, 74, 36, 0.15)",
        glow: "0 0 20px rgba(245, 158, 11, 0.35)",
        "forest-glow": "0 4px 20px rgba(15, 74, 36, 0.25)",
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

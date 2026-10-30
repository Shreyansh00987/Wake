import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        "ground-elevated": "var(--ground-elevated)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        hairline: "var(--hairline)",
        "hairline-light": "var(--hairline-light)",
        content: "var(--content)",
        "ash-light": "var(--ash-light)",
        ash: "var(--ash)",
        "ash-dark": "var(--ash-dark)",
        marigold: "var(--marigold)", // Strictly reserved for "still haunting"
        "marigold-glow": "var(--marigold-glow)",
        "marigold-dim": "var(--marigold-dim)",
        "marigold-border": "var(--marigold-border)",
        cause: {
          refactor: "var(--cause-refactor)",
          rewrite: "var(--cause-rewrite)",
          security: "var(--cause-security)",
          dependency: "var(--cause-dependency)",
          abandoned: "var(--cause-abandoned)",
          unknown: "var(--cause-unknown)",
        },
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "2px",
        lg: "2px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        10: "40px",
        16: "64px",
      },
    },
  },
  plugins: [],
};

export default config;

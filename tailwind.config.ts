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
        ground: "oklch(16% 0.01 260)",
        surface: "oklch(20% 0.01 260)",
        hairline: "oklch(26% 0.01 260)",
        "hairline-light": "oklch(32% 0.01 260)",
        content: "oklch(92% 0.01 260)",
        "ash-light": "oklch(75% 0.01 260)",
        ash: "oklch(60% 0.01 260)",
        "ash-dark": "oklch(40% 0.01 260)",
        marigold: "oklch(78% 0.15 75)", // EXCLUSIVELY for "still haunting"
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

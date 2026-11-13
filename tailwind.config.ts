import type { Config } from "tailwindcss";

// Design tokens. The same values are mirrored as CSS variables in
// src/app/globals.css for anything written in plain CSS — change both together.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Brand — do not change.
          primary: "#7f85f7",
          hover: "#6b71f0",
          navy: "#1a1a2e",
          hero: "#0d0d1a",
          quote: "#0F6E56",
          // Light purple tint behind icons and badges.
          tint: "#eeedfe",
          // Legacy names, still referenced around the site.
          light: "#8187fa",
          dark: "#1a1a2e",
          text: "#ffffff",
          section: "#ffffff",
          card: "#f7f8fa",
          footer: "#1a1a2e",
          panel: "#111111",
        },
        surface: "#f7f8fa",
        line: "#e5e7eb",
        ink: "#0f172a",
        // Context-aware: resolves to the light or the on-dark value depending
        // on the nearest .on-dark / .on-light ancestor (see globals.css).
        muted: "var(--muted)",
        accent: "var(--accent-text)",
        "on-dark-muted": "#c9cbe0",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        btn: "10px",
        card: "12px",
        input: "10px",
        img: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.06)",
        "card-hover": "0 8px 24px rgba(15,23,42,0.08)",
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};
export default config;

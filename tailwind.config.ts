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
        brand: {
          primary: "#7f85f7",
          light: "#8187fa",
          dark: "#2d2d2c",
          text: "#dee4fd",
          section: "#fefefd",
          card: "#f7f7f7",
          footer: "#252525",
          panel: "#111111",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

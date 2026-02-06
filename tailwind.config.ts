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
        sutra: {
          blush: "#E8D5D5",
          rose: "#C9A9A6",
          cream: "#FDF8F5",
          gold: "#B76E79",
          charcoal: "#5C4A4A",
          soft: "#F5EDED",
          mauve: "#D4B8B8",
          pearl: "#FAF6F4",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Jost", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      boxShadow: {
        sutra: "0 4px 24px rgba(92, 74, 74, 0.08)",
        "sutra-lg": "0 20px 60px rgba(92, 74, 74, 0.12)",
        "sutra-gold": "0 8px 24px rgba(183, 110, 121, 0.25)",
      },
      borderRadius: {
        "sutra": "1.25rem",
        "sutra-lg": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

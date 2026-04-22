import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./db/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#F5F5F5",
        ink: "#1D1D1B",
        cream: "#FAF7F1",
        purple: "#AE64DE",
        "purple-deep": "#9747FF",
        "purple-soft": "#EBD1FF",
        sky: "#80D3FF",
        "sky-deep": "#0088FF",
        red: "#FF383C",
        orange: "#FF8D28",
        yellow: "#FFED00",
        "green-sapin": "#046A38",
        green: "#00B95A",
        turquoise: "#2EC4B6",
        lila: "#C8A2FF",
        pink: "#FF6FA5",
        caramel: "#C68B4F",
        white: "#FFFFFF",
        "yellow-off": "#FFD914",
        "placeholder-sky": "#0077B8",
        "placeholder-orange": "#A54A00",
        "placeholder-yellow": "#666500",
        "placeholder-green": "#004A00",
        "placeholder-pink": "#A02B58",
        "hover-primary": "#C280E8",
        "hover-dark": "#000000",
      },
      fontFamily: {
        sans: ["SVHFlib", "Archivo Black", "system-ui", "sans-serif"],
        display: ["SVHFlib", "Archivo Black", "system-ui", "sans-serif"],
        soft: ["SVHFlib Soft", "SVHFlib", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["26px", { lineHeight: "1", letterSpacing: "0.01em", fontWeight: "700" }],
        h2: ["40px", { lineHeight: "0.95", letterSpacing: "-0.02em", fontWeight: "700" }],
        b1: ["16px", { lineHeight: "1.45", fontWeight: "500" }],
        b2: ["24px", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "700" }],
        menu: ["20px", { lineHeight: "1", letterSpacing: "0.06em", fontWeight: "700" }],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        phone: "22px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(29,29,27,0.03)",
        hover: "0 4px 12px rgba(29,29,27,0.1)",
        hard: "3px 3px 0 #1D1D1B",
        "hard-lg": "4px 4px 0 #1D1D1B",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      gridTemplateColumns: {
        shell: "248px minmax(0, 1fr)",
      },
    },
  },
};

export default config;

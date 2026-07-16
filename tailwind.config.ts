import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fredoka", "sans-serif"],
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#FF5A36",
        accent: "#FFC93C",
        ink: "var(--ink)",
        muted: "var(--muted)",
        muted2: "var(--muted2)",
        card: "var(--card)",
        cardBorder: "var(--card-border)",
        inputBorder: "var(--input-border)",
        navWrap: "var(--nav-wrap)",
        track: "var(--track)",
        danger: "#C23A3A",
        success: "#1F8A3B",
        successBg: "#E1F5E4",
        info: "#1D7A8C",
        infoBg: "#DDF3F6",
        warning: "#A6740A",
        warningBg: "#FFF3D1",
      },
      borderRadius: {
        xl2: "16px",
        xl3: "22px",
        xl4: "24px",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — vivid magenta/pink on near-black
        rose: {
          DEFAULT: "#FF2D87",
          50: "#FFF0F7",
          100: "#FFDCEE",
          200: "#FFADD6",
          300: "#FF7FBE",
          400: "#FF52A5",
          500: "#FF2D87",
          600: "#E0116B",
          700: "#B10E56",
          800: "#800A3D",
          900: "#4F0627",
        },
        cherry: {
          DEFAULT: "#D6006F",
          400: "#F0158C",
          500: "#D6006F",
          600: "#AD0059",
          700: "#800042",
        },
        blush: {
          DEFAULT: "#FFC9E4",
          light: "#FFE4F2",
        },
        "soft-red": "#C4005E",
        peach: {
          DEFAULT: "#FFB3D1",
          light: "#FFE0EE",
        },
        lavender: {
          DEFAULT: "#E9D6F7",
          light: "#F4E9FB",
        },
        coral: {
          DEFAULT: "#FF5FA8",
          light: "#FF9FC7",
        },
        cream: "#FFF3FA",
        "rose-gold": "#E88CB8",
        wine: {
          950: "#050005",
          900: "#0D0510",
          800: "#170A1E",
          700: "#22102C",
        },
      },
      backgroundImage: {
        "gradient-rose-coral": "linear-gradient(135deg, #FF2D87 0%, #FF5FA8 100%)",
        "gradient-cherry-peach": "linear-gradient(135deg, #D6006F 0%, #FF9FC7 100%)",
        "gradient-wine": "linear-gradient(160deg, #050005 0%, #170A1E 45%, #22102C 100%)",
        "gradient-glow": "radial-gradient(circle at 50% 0%, rgba(255,45,135,0.4), transparent 60%)",
      },
      borderRadius: {
        xl: "24px",
        "2xl": "28px",
        "3xl": "32px",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        utility: ["var(--font-utility)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(255,45,135,0.4)",
        "glow-lg": "0 0 80px rgba(255,45,135,0.5)",
        soft: "0 8px 30px rgba(0,0,0,0.5)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

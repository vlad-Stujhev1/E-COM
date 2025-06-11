import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Минималистичная цифровая палитра
        lime: "#d2ff1c",
        "lime-soft": "#e8ff66",
        black: "#000000",
        white: "#ffffff",
        grey: "#f5f5f5",
        "grey-dark": "#666666",
        "grey-light": "#fafafa",

        // Telegram WebApp compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#d2ff1c",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#000000",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SF Mono", "Monaco", "monospace"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["15px", { lineHeight: "22px" }],
        lg: ["17px", { lineHeight: "24px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0, 0, 0, 0.1)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.1)",
        strong: "0 8px 24px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      colors: {
        canvas: "#F6F7F9",
        surface: "#FFFFFF",
        brand: {
          50: "#EEF3FF",
          100: "#DCE6FF",
          200: "#B9CCFF",
          300: "#8FAAFC",
          400: "#5E80F3",
          500: "#3B62E6",
          600: "#2A4BCC",
          700: "#1E40AF",
          800: "#1B3893",
          900: "#172F78",
        },
        ink: {
          900: "#16181D",
          700: "#3A3F49",
          500: "#666D7A",
          400: "#878E9C",
          300: "#AEB4C0",
        },
        line: {
          DEFAULT: "#EAECF0",
          strong: "#DCE0E6",
        },
        signal: {
          red: "#FF3B30",
          redBg: "#FDECEC",
          amber: "#FFC400",
          amberBg: "#FFF6D6",
          blue: "#1E73E8",
          blueBg: "#E7F0FE",
          green: "#16C46A",
          greenBg: "#E4F8EE",
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        panel:
          "0 8px 24px rgba(16, 24, 40, 0.08), 0 2px 6px rgba(16, 24, 40, 0.04)",
        pop: "0 16px 48px rgba(16, 24, 40, 0.16)",
      },
    },
  },
  plugins: [],
};
export default config;

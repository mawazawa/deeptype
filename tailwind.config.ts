import { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "rgb(38, 38, 38)",
        background: "rgb(0, 0, 0)",
        foreground: "rgb(250, 250, 250)",
        primary: "rgb(250, 250, 250)",
        secondary: "rgb(115, 115, 115)",
        accent: "rgb(191, 191, 191)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        pulse: "pulse 2s infinite",
        "cursor-blink": "cursor-blink 1s step-end infinite"
      },
      keyframes: {
        "fadeIn": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slideUp": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" }
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

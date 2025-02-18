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
        "slide-in-from-left": "slideInFromLeft 0.5s ease-out forwards",
        "slide-in-from-right": "slideInFromRight 0.5s ease-out forwards",
        "slide-in-from-top": "slideInFromTop 0.5s ease-out forwards",
        "slide-in-from-bottom": "slideInFromBottom 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "scale-out": "scaleOut 0.5s ease-out forwards",
        pulse: "pulse 2s infinite",
        "cursor-blink": "cursor-blink 1s step-end infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "shimmer-fast": "shimmer 1s infinite linear",
        "shimmer-slow": "shimmer 3s infinite linear",
        "bounce-subtle": "bounceSubtle 2s infinite",
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
        "slideInFromLeft": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slideInFromRight": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slideInFromTop": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slideInFromBottom": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scaleIn": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scaleOut": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        "bounceSubtle": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-5px)",
          },
        },
      },
      backgroundImage: {
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

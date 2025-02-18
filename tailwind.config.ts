import type { Config } from 'tailwindcss'
import { fontFamily } from "tailwindcss/defaultTheme"

// Helper function to create semantic color definitions
const createSemanticColor = (name: string) => ({
  DEFAULT: `hsl(var(--${name}))`,
  foreground: `hsl(var(--${name}-foreground))`
});

// Helper function to create animation definitions
const createAnimation = (name: string, duration = "0.5s", timing = "ease-out") => ({
  [`${name}`]: `${name} ${duration} ${timing} forwards`,
  [`${name}-infinite`]: `${name} ${duration} ${timing} infinite`,
});

const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: createSemanticColor('primary'),
        secondary: createSemanticColor('secondary'),
        destructive: createSemanticColor('destructive'),
        muted: createSemanticColor('muted'),
        accent: createSemanticColor('accent'),
        popover: createSemanticColor('popover'),
        card: createSemanticColor('card'),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      animation: {
        ...createAnimation("fade-in"),
        ...createAnimation("slide-up"),
        ...createAnimation("slide-in-from-left"),
        ...createAnimation("slide-in-from-right"),
        ...createAnimation("slide-in-from-top"),
        ...createAnimation("slide-in-from-bottom"),
        ...createAnimation("scale-in"),
        ...createAnimation("scale-out"),
        "cursor-blink": "cursor-blink 1s step-end infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "shimmer-fast": "shimmer 1s infinite linear",
        "shimmer-slow": "shimmer 3s infinite linear",
        "bounce-subtle": "bounceSubtle 2s infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
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
        "bounce-subtle": {
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
  plugins: [
    // @ts-expect-error - Plugin types are not available
    (await import('@tailwindcss/typography')).default,
    // @ts-expect-error - Plugin types are not available
    (await import('tailwindcss-animate')).default,
    // Add plugin for better dark mode handling
    function({ addBase }) {
      addBase({
        ':root': {
          '--font-sans': fontFamily.sans.join(', '),
          '--font-mono': fontFamily.mono.join(', '),
        },
      });
    },
  ],
} satisfies Config;

export default config

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      colors: {
        brand: {
          primary: "var(--color-primary)",
          secondary: "var(--color-secondary)",
          accent: "var(--color-accent)"
        },
        surface: "var(--color-surface)",
        surface2: "var(--color-surface-2)",
        line: "var(--color-border)",
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)"
        },
        state: {
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          error: "var(--color-error)",
          info: "var(--color-info)"
        },
        appbg: "var(--color-background)",
        chatuser: "var(--color-chat-user)",
        chatai: "var(--color-chat-ai)"
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem"
      },
      boxShadow: {
        soft: "0 12px 35px rgba(31, 41, 51, 0.08)",
        lift: "0 8px 25px rgba(31, 41, 51, 0.10)",
        glow: "0 0 0 3px rgba(79,163,227,0.25)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-up": "fade-up 360ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
        "slide-right": "slide-right 280ms ease-out",
        shimmer: "shimmer 1.8s infinite linear"
      }
    }
  },
  plugins: []
};

export default config;

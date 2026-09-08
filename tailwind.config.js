/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          light: "#818cf8",
          dark: "#4338ca",
          soft: "#e0e7ff",
        },
        paper: {
          DEFAULT: "#f4f6fb",
          soft: "#ffffff",
          line: "rgba(0,0,0,0.08)",
        },
        ink: {
          DEFAULT: "#1e293b",
          soft: "#64748b",
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.8)",
          border: "rgba(0,0,0,0.08)",
          hover: "rgba(255,255,255,0.95)",
        },
        emerald: {
          DEFAULT: "#10b981",
          soft: "#34d399",
        },
        rose: {
          DEFAULT: "#e11d6a",
          soft: "#fb7aaa",
          glow: "rgba(225,29,106,0.15)",
        },
        amber: {
          DEFAULT: "#f59e0b",
          soft: "#fbbf24",
        },
        leaf: "#10b981",
        box: "rgba(0,0,0,0.04)",
        slate: "#64748b",
        plum: "#7c3aed",
      },
      fontFamily: {
        display: ["'Sora'", "'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        cardHover: "0 0 0 1px rgba(79,70,229,0.2), 0 8px 32px -8px rgba(79,70,229,0.12), 0 2px 4px rgba(0,0,0,0.06)",
        pop: "0 24px 80px -16px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)",
        glow: "0 0 20px rgba(79,70,229,0.25)",
        glowEmerald: "0 0 20px rgba(16,185,129,0.25)",
        glowAmber: "0 0 20px rgba(245,158,11,0.25)",
        statGlow: "0 4px 24px -4px rgba(79,70,229,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
      },
      borderRadius: {
        xl2: "1.25rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: 0, transform: "scale(0.94)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        floatOrb: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-24px) scale(1.04)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        glowPulse: {
          "0%, 100%": { opacity: 0.6, boxShadow: "0 0 16px rgba(79,70,229,0.2)" },
          "50%": { opacity: 1, boxShadow: "0 0 32px rgba(79,70,229,0.35)" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        slideDown: {
          "0%": { opacity: 0, transform: "translateY(-6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out both",
        popIn: "popIn 0.22s ease-out both",
        floatOrb: "floatOrb 7s ease-in-out infinite",
        floatOrbSlow: "floatOrb 11s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        glowPulse: "glowPulse 2.5s ease-in-out infinite",
        slideDown: "slideDown 0.3s ease-out both",
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)",
        "rose-glow": "radial-gradient(ellipse at center, rgba(79,70,229,0.15) 0%, transparent 70%)",
        "emerald-glow": "radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)",
        "progress-gradient": "linear-gradient(90deg, #4f46e5, #7c3aed, #10b981)",
      },
    },
  },
  plugins: [],
};

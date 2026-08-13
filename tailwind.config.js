/** @type {import('tailwindcss').Config} */

function withOpacity(variable) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variable}) / ${opacityValue})`;
    }
    return `rgb(var(${variable}))`;
  };
}

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2c2c2c",
          light: "#e06b85",
          dark: "#d64161",
          soft: "#f3f4f4",
        },
        paper: {
          DEFAULT: "#f3f4f4",
          soft: "#e06b85",
          line: "#d64161",
        },
        ink: {
          DEFAULT: "#e06b85",
          soft: "#d64161",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.08), 0 6px 16px -6px rgba(0,0,0,0.16)",
        cardHover: "0 2px 4px rgba(0,0,0,0.1), 0 12px 28px -8px rgba(0,0,0,0.24)",
        pop: "0 20px 60px -12px rgba(0,0,0,0.45)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out both",
        popIn: "popIn 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

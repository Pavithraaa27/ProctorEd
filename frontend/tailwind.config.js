/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#0A0E1A",
          soft: "#0D1420",
        },
        panel: {
          DEFAULT: "#131A2B",
          raised: "#182238",
          border: "#232E48",
        },
        signal: {
          DEFAULT: "#4CC9F0",
          dim: "#2A7EA0",
          soft: "#173447",
        },
        violet: {
          DEFAULT: "#7C5CFC",
          soft: "#241C47",
        },
        alert: {
          DEFAULT: "#FF5D6C",
          soft: "#3A1620",
        },
        verified: {
          DEFAULT: "#2DD9A3",
          soft: "#0E2E28",
        },
        ink: {
          DEFAULT: "#EAF0FF",
          muted: "#8291B5",
          faint: "#4C5B7F",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 1px rgba(0,0,0,0.2), 0 12px 32px -8px rgba(0,0,0,0.55)",
        glow: "0 0 0 1px rgba(76,201,240,0.25), 0 0 24px rgba(76,201,240,0.15)",
        glowAlert: "0 0 0 1px rgba(255,93,108,0.3), 0 0 24px rgba(255,93,108,0.18)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(76,201,240,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,0.06) 1px, transparent 1px)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        scanline: "scanline 3s linear infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        fadeUp: "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

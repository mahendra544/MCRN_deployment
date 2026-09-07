/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#e02323",
          dark: "#bd1818",
          light: "#fff0f0",
          soft: "#fff7f7",
        },
        ink: "#171717",
        muted: "#69707a",
      },
      boxShadow: {
        panel: "0 12px 32px -12px rgba(23,23,23,0.16)",
      },
      keyframes: {
        pageIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        sweepHand: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        clockPulse: {
          "0%": { transform: "scale(0.94)", opacity: 0.8 },
          "70%": { transform: "scale(1.08)", opacity: 0 },
          "100%": { transform: "scale(1.08)", opacity: 0 },
        },
      },
      animation: {
        pageIn: "pageIn 550ms ease both",
        floaty: "floaty 5s ease-in-out infinite",
        sweepHand: "sweepHand 8s linear infinite",
        clockPulse: "clockPulse 4s ease infinite",
      },
    },
  },
  plugins: [],
};

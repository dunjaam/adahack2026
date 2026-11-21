/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // derived from the ZrakVizija logo (hills / leaf greens)
        brand: {
          50: "#eef7f0",
          100: "#d6eed0",
          200: "#b4e0ac",
          300: "#93d193",
          400: "#6fc27e",
          500: "#4fae60",
          600: "#3a8f50",
          700: "#2f7d52",
          800: "#276744",
          900: "#1e4d34",
        },
        // logo sky / leaf blue accent
        teal: {
          400: "#8ecbdd",
          500: "#5cb4ce",
          600: "#3e97b5",
        },
        ink: "#1e2a3a", // logo wordmark navy
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)",
        float: "0 10px 30px rgba(16,24,40,0.12)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "pop": { "0%": { transform: "scale(0.96)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        "pop": "pop 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

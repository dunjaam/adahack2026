/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        teal: {
          500: "#14b8a6",
          600: "#0d9488",
        },
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

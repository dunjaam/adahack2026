/** @type {import('tailwindcss').Config} */

/*
 * ZrakVizija design system
 * ------------------------------------------------------------------
 * Paper  — warm off-white surfaces           (paper, surface)
 * Ink    — charcoal typography, 3 strengths  (ink, ink-2, ink-3)
 * Line   — hairline dividers                 (line, line-2)
 * Accent — deep teal for interaction/state   (accent / brand / teal)
 * Pollutant severity colours live in lib.tsx (pmColor / pmInk) and
 * are never used for UI chrome.
 *
 * `slate` and `brand` are remapped onto the warm neutral and teal scales
 * so every existing component inherits the system consistently.
 */
const neutral = {
  50: "#F7F5F0",
  100: "#EFECE6",
  200: "#E2DED6",
  300: "#CFCAC0",
  400: "#8F8A80", // tertiary text — still ≥4.5:1 on paper at 11px+
  500: "#6B675F",
  600: "#4E4B45",
  700: "#383631",
  800: "#26251F",
  900: "#1A1A17",
};

const teal = {
  50: "#E8F1EF",
  100: "#CFE3DF",
  200: "#A3CAC3",
  300: "#6FAAA1",
  400: "#3E8A80",
  500: "#1D7268",
  600: "#125F57",
  700: "#0E4F49",
  800: "#0B3F3A",
  900: "#082F2B",
};

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F2ED",
        surface: "#FBFAF7",
        ink: { DEFAULT: "#1C1D1B", 2: "#45443F", 3: "#76736B" },
        line: { DEFAULT: "#DCD8CF", 2: "#E9E6DF" },
        accent: { DEFAULT: teal[500], ...teal },
        brand: teal,
        teal,
        slate: neutral,
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // tight, deliberate scale (size / line-height)
        "2xs": ["10px", "14px"],
        xs: ["11px", "16px"],
        sm: ["12.5px", "18px"],
        base: ["13.5px", "20px"],
      },
      letterSpacing: {
        label: "0.08em",
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "5px",
        lg: "6px",
        xl: "7px",
        "2xl": "8px",
      },
      boxShadow: {
        card: "none",
        float: "0 1px 2px rgba(28,29,27,0.06), 0 6px 20px rgba(28,29,27,0.08)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(2px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pop: { "0%": { opacity: "0.6" }, "100%": { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        pop: "pop 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

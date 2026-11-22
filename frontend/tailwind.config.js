/** @type {import('tailwindcss').Config} */
import { md } from "./src/theme/material.js";

/*
 * ZrakVizija design system — Google Material Design palette only.
 * ------------------------------------------------------------------
 * paper / surface   Grey 100 / White
 * ink, ink-2, ink-3 Grey 900 / 700 / 600   (primary / secondary / hint text)
 * line, line-2      Grey 300 / 200         (dividers)
 * accent            Teal                    (interaction, positive change)
 * danger / warn     Red / Orange            (over budget, worsening)
 * Pollutant severity scales live in lib.tsx and also use md.* only.
 *
 * Tailwind's default colour names are remapped onto Material palettes so
 * every component (incl. Docs, charts) is Material without per-file edits.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: md.grey[100],
        surface: md.white,
        ink: { DEFAULT: md.grey[900], 2: md.grey[700], 3: md.grey[600] },
        line: { DEFAULT: md.grey[300], 2: md.grey[200] },
        accent: { DEFAULT: md.teal[500], ...md.teal },
        danger: { DEFAULT: md.red[700], ...md.red },
        warn: { DEFAULT: md.orange[800], ...md.orange },
        brand: md.teal,
        teal: md.teal,
        slate: md.grey,
        gray: md.grey,
        zinc: md.grey,
        stone: md.grey,
        neutral: md.grey,
        red: md.red,
        rose: md.red,
        orange: md.orange,
        amber: md.amber,
        yellow: md.yellow,
        lime: md.lightGreen,
        green: md.green,
        emerald: md.green,
        sky: md.lightBlue,
        cyan: md.lightBlue,
        blue: md.blue,
        indigo: md.indigo,
        violet: md.deepPurple,
        purple: md.deepPurple,
        white: md.white,
        black: md.black,
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
        float: "0 2px 4px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)" /* Material elevation 4dp */,
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

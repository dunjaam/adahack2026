/** @type {import('tailwindcss').Config} */
import { md, m3, primary } from "./src/theme/material.js";

/*
 * ZrakVizija design system — Material Design 3.
 * ------------------------------------------------------------------
 * Semantic M3 roles (preferred in components):
 *   primary / on-primary / primary-container / on-primary-container   blue
 *   secondary / secondary-container / on-secondary-container          teal
 *   surface, surface-container-{lowest,low,DEFAULT,high,highest}      neutrals
 *   on-surface, on-surface-variant, outline, outline-variant          text, dividers
 *   positive*, error*                                                  results
 *
 * Legacy aliases (ink / paper / line / accent / brand) map onto the same
 * roles so every screen shares one system.
 *
 * Green / yellow / orange / red stay Material reference palettes and are
 * reserved for pollution severity & environmental outcomes.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ---- M3 roles ---- */
        primary: { DEFAULT: m3.primary, ...primary },
        "on-primary": m3.onPrimary,
        "primary-container": m3.primaryContainer,
        "on-primary-container": m3.onPrimaryContainer,
        secondary: { DEFAULT: m3.secondary, ...md.teal },
        "secondary-container": m3.secondaryContainer,
        "on-secondary-container": m3.onSecondaryContainer,
        "surface-container": {
          lowest: m3.surfaceContainerLowest,
          low: m3.surfaceContainerLow,
          DEFAULT: m3.surfaceContainer,
          high: m3.surfaceContainerHigh,
          highest: m3.surfaceContainerHighest,
        },
        "on-surface": { DEFAULT: m3.onSurface, variant: m3.onSurfaceVariant, muted: m3.onSurfaceMuted },
        outline: { DEFAULT: m3.outline, variant: m3.outlineVariant },
        positive: { DEFAULT: m3.positive, container: m3.positiveContainer, on: m3.onPositiveContainer },
        error: { DEFAULT: m3.error, container: m3.errorContainer, on: m3.onErrorContainer },

        /* ---- legacy aliases onto the M3 roles ---- */
        paper: m3.surfaceContainer, // app background
        surface: m3.surfaceContainerLowest, // cards / sheets
        ink: { DEFAULT: m3.onSurface, 2: m3.onSurfaceVariant, 3: m3.onSurfaceMuted },
        line: { DEFAULT: m3.outlineVariant, 2: m3.surfaceContainerHigh },
        accent: { DEFAULT: m3.primary, ...primary },
        brand: primary,
        danger: { DEFAULT: md.red[700], ...md.red },
        warn: { DEFAULT: md.orange[800], ...md.orange },

        /* ---- Tailwind default names → Material reference palettes ---- */
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
        blue: primary,
        indigo: md.indigo,
        violet: md.deepPurple,
        purple: md.deepPurple,
        white: md.white,
        black: md.black,
      },
      fontFamily: {
        sans: ['"Barlow"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Barlow Condensed"', '"Barlow"', "ui-sans-serif", "sans-serif"],
        // kept for code snippets only — never for ordinary UI text
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // M3-aligned type scale (size / line-height), sized for Barlow
        "2xs": ["12px", "16px"],
        xs: ["12.5px", "18px"],
        sm: ["14px", "20px"],
        base: ["15px", "22px"],
        title: ["16px", "24px"],
        lg: ["18px", "26px"],
        xl: ["22px", "28px"],
      },
      opacity: {
        8: "0.08",
        12: "0.12",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "none",
        // M3 elevation level 1 / 2
        e1: "0 1px 2px rgba(25,28,32,0.10), 0 1px 3px 1px rgba(25,28,32,0.06)",
        float: "0 2px 6px 2px rgba(25,28,32,0.08), 0 1px 2px rgba(25,28,32,0.12)",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(-4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pop: { "0%": { opacity: "0.6" }, "100%": { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 0.18s cubic-bezier(0.2, 0, 0, 1)",
        pop: "pop 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

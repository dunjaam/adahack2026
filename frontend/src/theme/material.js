/*
 * ZrakVizija colour foundations.
 *
 *  m3  — Material Design 3 tonal roles (light scheme). Interface chrome only:
 *        refined blue primary, subtle teal secondary, cool neutral surfaces.
 *  md  — Material reference palettes. Green / yellow / orange / red are
 *        RESERVED for pollution severity and environmental results.
 *
 * Single source of truth: imported by tailwind.config.js AND by TS code
 * (map layers, charts, export, pollutant scales). Use these — no ad-hoc hexes.
 */
export const md = {
  grey: { 50: "#FAFAFA", 100: "#F5F5F5", 200: "#EEEEEE", 300: "#E0E0E0", 400: "#BDBDBD", 500: "#9E9E9E", 600: "#757575", 700: "#616161", 800: "#424242", 900: "#212121" },
  blueGrey: { 50: "#ECEFF1", 100: "#CFD8DC", 200: "#B0BEC5", 300: "#90A4AE", 400: "#78909C", 500: "#607D8B", 600: "#546E7A", 700: "#455A64", 800: "#37474F", 900: "#263238" },
  teal: { 50: "#E0F2F1", 100: "#B2DFDB", 200: "#80CBC4", 300: "#4DB6AC", 400: "#26A69A", 500: "#009688", 600: "#00897B", 700: "#00796B", 800: "#00695C", 900: "#004D40" },
  green: { 50: "#E8F5E9", 100: "#C8E6C9", 200: "#A5D6A7", 300: "#81C784", 400: "#66BB6A", 500: "#4CAF50", 600: "#43A047", 700: "#388E3C", 800: "#2E7D32", 900: "#1B5E20" },
  lightGreen: { 50: "#F1F8E9", 100: "#DCEDC8", 200: "#C5E1A5", 300: "#AED581", 400: "#9CCC65", 500: "#8BC34A", 600: "#7CB342", 700: "#689F38", 800: "#558B2F", 900: "#33691E" },
  yellow: { 50: "#FFFDE7", 100: "#FFF9C4", 200: "#FFF59D", 300: "#FFF176", 400: "#FFEE58", 500: "#FFEB3B", 600: "#FDD835", 700: "#FBC02D", 800: "#F9A825", 900: "#F57F17" },
  amber: { 50: "#FFF8E1", 100: "#FFECB3", 200: "#FFE082", 300: "#FFD54F", 400: "#FFCA28", 500: "#FFC107", 600: "#FFB300", 700: "#FFA000", 800: "#FF8F00", 900: "#FF6F00" },
  orange: { 50: "#FFF3E0", 100: "#FFE0B2", 200: "#FFCC80", 300: "#FFB74D", 400: "#FFA726", 500: "#FF9800", 600: "#FB8C00", 700: "#F57C00", 800: "#EF6C00", 900: "#E65100" },
  deepOrange: { 50: "#FBE9E7", 100: "#FFCCBC", 200: "#FFAB91", 300: "#FF8A65", 400: "#FF7043", 500: "#FF5722", 600: "#F4511E", 700: "#E64A19", 800: "#D84315", 900: "#BF360C" },
  red: { 50: "#FFEBEE", 100: "#FFCDD2", 200: "#EF9A9A", 300: "#E57373", 400: "#EF5350", 500: "#F44336", 600: "#E53935", 700: "#D32F2F", 800: "#C62828", 900: "#B71C1C" },
  lightBlue: { 50: "#E1F5FE", 100: "#B3E5FC", 200: "#81D4FA", 300: "#4FC3F7", 400: "#29B6F6", 500: "#03A9F4", 600: "#039BE5", 700: "#0288D1", 800: "#0277BD", 900: "#01579B" },
  blue: { 50: "#E3F2FD", 100: "#BBDEFB", 200: "#90CAF9", 300: "#64B5F6", 400: "#42A5F5", 500: "#2196F3", 600: "#1E88E5", 700: "#1976D2", 800: "#1565C0", 900: "#0D47A1" },
  indigo: { 50: "#E8EAF6", 100: "#C5CAE9", 200: "#9FA8DA", 300: "#7986CB", 400: "#5C6BC0", 500: "#3F51B5", 600: "#3949AB", 700: "#303F9F", 800: "#283593", 900: "#1A237E" },
  deepPurple: { 50: "#EDE7F6", 100: "#D1C4E9", 200: "#B39DDB", 300: "#9575CD", 400: "#7E57C2", 500: "#673AB7", 600: "#5E35B1", 700: "#512DA8", 800: "#4527A0", 900: "#311B92" },
  white: "#FFFFFF",
  black: "#000000",
};

/** Primary tonal scale (blue, hue ≈ 215°) — tone 40 = primary. */
export const primary = {
  50: "#EEF3FC", 100: "#D8E3FB", 200: "#B2C8F1", 300: "#88A9E3", 400: "#5F89D1",
  500: "#3F6FBD", 600: "#2C5DA8", 700: "#224B8A", 800: "#183A6C", 900: "#0B2A57",
};

/** Material 3 colour roles (light). */
export const m3 = {
  primary: primary[600],
  onPrimary: "#FFFFFF",
  primaryContainer: primary[100],
  onPrimaryContainer: primary[900],

  secondary: "#2D6A69",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#CCE8E6",
  onSecondaryContainer: "#0D3534",

  surface: "#F7F8FB",
  surfaceDim: "#D9DBE1",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F2F4F7",
  surfaceContainer: "#ECEEF2",
  surfaceContainerHigh: "#E5E8EC",
  surfaceContainerHighest: "#DFE2E7",

  onSurface: "#191C20",
  onSurfaceVariant: "#43474E",
  onSurfaceMuted: "#5E636B",
  outline: "#74777F",
  outlineVariant: "#C4C7CE",

  error: "#B3261E",
  errorContainer: "#F9DEDC",
  onErrorContainer: "#410E0B",

  /* environmental result roles (built on md.green / md.red) */
  positive: "#1E7B3A",
  positiveContainer: "#DDF1E2",
  onPositiveContainer: "#0D3A1A",
};

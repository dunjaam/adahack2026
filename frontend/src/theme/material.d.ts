type Shades = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
export declare const md: {
  grey: Shades; blueGrey: Shades; teal: Shades; green: Shades; lightGreen: Shades;
  yellow: Shades; amber: Shades; orange: Shades; deepOrange: Shades; red: Shades;
  lightBlue: Shades; blue: Shades; indigo: Shades; deepPurple: Shades;
  white: string; black: string;
};
export declare const primary: Shades;
export declare const m3: Record<
  | "primary" | "onPrimary" | "primaryContainer" | "onPrimaryContainer"
  | "secondary" | "onSecondary" | "secondaryContainer" | "onSecondaryContainer"
  | "surface" | "surfaceDim" | "surfaceContainerLowest" | "surfaceContainerLow"
  | "surfaceContainer" | "surfaceContainerHigh" | "surfaceContainerHighest"
  | "onSurface" | "onSurfaceVariant" | "onSurfaceMuted" | "outline" | "outlineVariant"
  | "error" | "errorContainer" | "onErrorContainer"
  | "positive" | "positiveContainer" | "onPositiveContainer",
  string
>;

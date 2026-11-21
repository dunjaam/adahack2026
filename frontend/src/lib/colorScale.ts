// Sequential YlOrRd-style color ramp for PM10 shading on the map.
// Stops: pale yellow → orange → deep red.

const STOPS: Array<[number, [number, number, number]]> = [
  [0.0, [255, 255, 204]],
  [0.25, [255, 237, 160]],
  [0.5, [254, 178, 76]],
  [0.75, [240, 59, 32]],
  [1.0, [189, 0, 38]],
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rgbAt(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, t));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [p0, c0] = STOPS[i];
    const [p1, c1] = STOPS[i + 1];
    if (x >= p0 && x <= p1) {
      const k = (x - p0) / (p1 - p0 || 1);
      return [
        Math.round(lerp(c0[0], c1[0], k)),
        Math.round(lerp(c0[1], c1[1], k)),
        Math.round(lerp(c0[2], c1[2], k)),
      ];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}

export function pm10Color(value: number, min: number, max: number): string {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const [r, g, b] = rgbAt(t);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

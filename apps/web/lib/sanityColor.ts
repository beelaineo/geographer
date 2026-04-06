import type { Color } from "../types/sanity.generated";

export function colorToCss(color: Color | null | undefined): string | undefined {
  if (!color?.hex) {
    return undefined;
  }

  const alpha = typeof color.alpha === "number" ? color.alpha : 1;
  if (alpha >= 0.999) {
    return color.hex;
  }

  const hex = color.hex.replace("#", "");
  if (hex.length !== 6) {
    return color.hex;
  }

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

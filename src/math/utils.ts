/** Tolerance used for floating-point comparisons throughout the engine. */
export const EPSILON = 1e-6;

/** Clamp `value` into the closed interval [`min`, `max`]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Linear interpolation between `a` and `b` (`t = 0` → `a`, `t = 1` → `b`). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Convert degrees to radians. */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Convert radians to degrees. */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** `true` if `a` and `b` differ by at most `epsilon`. */
export function approxEqual(a: number, b: number, epsilon = EPSILON): boolean {
  return Math.abs(a - b) <= epsilon;
}

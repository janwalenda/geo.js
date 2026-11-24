import type { Vec3 } from '../math/Vec3';
import type { Corner } from './types';

/**
 * Sutherland–Hodgman against the near plane z = −near (view space, keep
 * z ≤ −near). UVs are interpolated linearly along the cut edges, which is
 * exact in view space.
 */
export function clipCornersNear(polygon: Corner[], near: number): Corner[] {
  const limit = -near;
  if (polygon.every((c) => c.p.z <= limit)) {
    return polygon;
  }
  const result: Corner[] = [];
  polygon.forEach((a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    const aIn = a.p.z <= limit;
    if (aIn) {
      result.push(a);
    }
    if (aIn !== b.p.z <= limit) {
      const t = (limit - a.p.z) / (b.p.z - a.p.z);
      result.push({
        p: a.p.clone().lerp(b.p, t),
        uv: a.uv.clone().lerp(b.uv, t),
      });
    }
  });
  return result;
}

/**
 * The part of segment `a`–`b` in front of the near plane, or `null` if none.
 */
export function clipSegmentNear(
  a: Vec3,
  b: Vec3,
  near: number,
): [Vec3, Vec3] | null {
  const limit = -near;
  const aIn = a.z <= limit;
  const bIn = b.z <= limit;
  if (aIn && bIn) {
    return [a, b];
  }
  if (!aIn && !bIn) {
    return null;
  }
  const hit = a.clone().lerp(b, (limit - a.z) / (b.z - a.z));
  return aIn ? [a, hit] : [hit, b];
}

/**
 * Split a view-space path into continuous runs of segments that survive
 * near-plane clipping.
 */
export function clipPathNear(path: Vec3[], near: number): Vec3[][] {
  const runs: Vec3[][] = [];
  let run: Vec3[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const segment = clipSegmentNear(path[i], path[i + 1], near);
    const last = run.at(-1);
    if (!segment || (last && !last.equals(segment[0]))) {
      if (run.length > 0) {
        runs.push(run);
      }
      run = [];
    }
    if (segment) {
      run.push(...(run.length === 0 ? segment : [segment[1]]));
    }
  }
  if (run.length > 0) {
    runs.push(run);
  }
  return runs;
}

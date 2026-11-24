import { Vec3 } from '../math/Vec3';
import { Vec4 } from '../math/Vec4';
import type { CompileContext, ScreenProjection } from './types';

const clip = new Vec4();

/**
 * View space → screen space (CSS pixels), returned as a flat
 * `[x0, y0, x1, y1, …]` array.
 */
export function projectAll(points: Vec3[], ctx: ScreenProjection): number[] {
  const out = new Array<number>(points.length * 2);
  points.forEach((p, i) => {
    clip.set(p.x, p.y, p.z, 1).applyMat4(ctx.projection);
    out[i * 2] = ((clip.x / clip.w + 1) / 2) * ctx.width;
    out[i * 2 + 1] = ((1 - clip.y / clip.w) / 2) * ctx.height;
  });
  return out;
}

/** Shoelace formula on a flat point array (positive = clockwise on screen). */
export function signedArea(points: number[]): number {
  let area = 0;
  const n = points.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area +=
      points[i * 2] * points[j * 2 + 1] - points[j * 2] * points[i * 2 + 1];
  }
  return area / 2;
}

/**
 * Whether a flat screen polygon lies completely outside the viewport, with a
 * `margin` in pixels (e.g. for line widths).
 */
export function outsideViewport(
  points: number[],
  ctx: CompileContext,
  margin: number,
): boolean {
  const xs = points.filter((_, i) => i % 2 === 0);
  const ys = points.filter((_, i) => i % 2 === 1);
  return (
    Math.max(...xs) < -margin ||
    Math.min(...xs) > ctx.width + margin ||
    Math.max(...ys) < -margin ||
    Math.min(...ys) > ctx.height + margin
  );
}

/** Mean distance in front of the camera (positive). */
export function averageDistance(points: Vec3[]): number {
  let sum = 0;
  for (const p of points) {
    sum -= p.z;
  }
  return sum / points.length;
}

/** Robust polygon normal (Newell's method), normalized; written to `out`. */
export function newellNormal(
  vertices: Vec3[],
  face: number[],
  out: Vec3,
): Vec3 {
  out.set(0, 0, 0);
  face.forEach((index, i) => {
    const a = vertices[index];
    const b = vertices[face[(i + 1) % face.length]];
    out.x += (a.y - b.y) * (a.z + b.z);
    out.y += (a.z - b.z) * (a.x + b.x);
    out.z += (a.x - b.x) * (a.y + b.y);
  });
  return out.normalize();
}

/** Mean of the face's corners. */
export function centroid(vertices: Vec3[], face: number[]): Vec3 {
  const center = new Vec3();
  for (const i of face) {
    center.add(vertices[i]);
  }
  return center.scale(1 / face.length);
}

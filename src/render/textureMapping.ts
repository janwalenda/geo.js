import { Vec2 } from '../math/Vec2';
import { Vec3 } from '../math/Vec3';
import { signedArea } from './projection';
import type { AffineMatrix, Corner, CornerTriangle } from './types';

/**
 * The affine map that sends the texture triangle `(u0, v0), (u1, v1),
 * (u2, v2)` onto the screen triangle `(x0, y0), (x1, y1), (x2, y2)`, as
 * `[a, b, c, d, e, f]` with `x = a·u + c·v + e`, `y = b·u + d·v + f`. Returns
 * `null` if the texture triangle is degenerate (zero area). Both inputs are
 * flat arrays of three points.
 */
export function affineFromTriangle(
  uv: ArrayLike<number>,
  xy: ArrayLike<number>,
): AffineMatrix | null {
  const du1 = uv[2] - uv[0];
  const dv1 = uv[3] - uv[1];
  const du2 = uv[4] - uv[0];
  const dv2 = uv[5] - uv[1];
  const det = du1 * dv2 - du2 * dv1;
  if (Math.abs(det) < 1e-12) {
    return null;
  }
  const dx1 = xy[2] - xy[0];
  const dy1 = xy[3] - xy[1];
  const dx2 = xy[4] - xy[0];
  const dy2 = xy[5] - xy[1];
  const a = (dx1 * dv2 - dx2 * dv1) / det;
  const b = (dy1 * dv2 - dy2 * dv1) / det;
  const c = (dx2 * du1 - dx1 * du2) / det;
  const d = (dy2 * du1 - dy1 * du2) / det;
  const e = xy[0] - a * uv[0] - c * uv[1];
  const f = xy[1] - b * uv[0] - d * uv[1];
  return [a, b, c, d, e, f];
}

/**
 * Grow a convex polygon (flat screen points) by pushing every edge `amount`
 * pixels outwards (miter offset, capped at `4 · amount` per corner so slivers
 * do not spike). Slightly overlapping clip regions hide the anti-aliasing
 * seams between neighbouring textured triangles. Returns a new array; the
 * input is not modified.
 */
export function inflatePolygon(points: number[], amount: number): number[] {
  const n = points.length / 2;
  const area = signedArea(points);
  if (amount <= 0 || n < 3 || area === 0) {
    return points;
  }
  const normals = outwardEdgeNormals(points, area > 0 ? 1 : -1);
  const cap = 4 * amount;
  const out = new Array<number>(points.length);
  for (let i = 0; i < n; i++) {
    // Corner offset m with m·n_k = m·n_i = amount, where k is the edge
    // ending at vertex i: m = amount · (n_k + n_i) / (1 + n_k·n_i).
    const prev = normals[(i + n - 1) % n];
    const next = normals[i];
    const denom = 1 + prev.dot(next);
    const offset =
      denom > 1e-9
        ? prev
            .clone()
            .add(next)
            .scale(amount / denom)
        : next.clone().scale(amount);
    const len = offset.length();
    if (len > cap) {
      offset.scale(cap / len);
    }
    out[i * 2] = points[i * 2] + offset.x;
    out[i * 2 + 1] = points[i * 2 + 1] + offset.y;
  }
  return out;
}

/**
 * Outward unit normal of every edge `i → i + 1` of a flat screen polygon
 * whose winding has the sign `sign` (of its {@link signedArea}).
 */
function outwardEdgeNormals(points: number[], sign: number): Vec2[] {
  const n = points.length / 2;
  const normals: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = points[j * 2] - points[i * 2];
    const dy = points[j * 2 + 1] - points[i * 2 + 1];
    const len = Math.hypot(dx, dy) || 1;
    normals.push(new Vec2((sign * dy) / len, (-sign * dx) / len));
  }
  return normals;
}

/**
 * Subdivisions per edge for `'auto'` texture detail. The error of affine
 * mapping grows with the depth ratio of the triangle's corners (distances in
 * front of the camera), so near, steep triangles get more pieces. Result in
 * [1, 8].
 */
export function autoTextureDetail(nearest: number, farthest: number): number {
  if (nearest <= 0) {
    return 8;
  }
  return Math.min(8, Math.max(1, Math.ceil((farthest / nearest - 1) * 12)));
}

/**
 * Split a triangle into `n²` smaller ones along a barycentric grid: corner
 * `(i, j) = a + (b − a)·i/n + (c − a)·j/n` for `i + j ≤ n`. Positions and
 * texture coordinates are interpolated linearly.
 */
export function subdivideTriangle(
  triangle: CornerTriangle,
  n: number,
): CornerTriangle[] {
  const grid: Corner[][] = [];
  for (let i = 0; i <= n; i++) {
    grid.push([]);
    for (let j = 0; i + j <= n; j++) {
      grid[i].push(barycentric(triangle, i / n, j / n));
    }
  }
  const result: CornerTriangle[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; i + j < n; j++) {
      result.push([grid[i][j], grid[i + 1][j], grid[i][j + 1]]);
      if (i + j + 1 < n) {
        result.push([grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]);
      }
    }
  }
  return result;
}

/** The corner `a + (b − a)·s + (c − a)·t` of a triangle `[a, b, c]`. */
function barycentric(triangle: CornerTriangle, s: number, t: number): Corner {
  const [a, b, c] = triangle;
  const p = new Vec3()
    .copy(a.p)
    .add(b.p.clone().sub(a.p).scale(s))
    .add(c.p.clone().sub(a.p).scale(t));
  const uv = new Vec2()
    .copy(a.uv)
    .add(b.uv.clone().sub(a.uv).scale(s))
    .add(c.uv.clone().sub(a.uv).scale(t));
  return { p, uv };
}

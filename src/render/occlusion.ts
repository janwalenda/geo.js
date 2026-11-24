import type { Vec3 } from '../math/Vec3';
import type { DepthItem, FacePlane } from './types';

/**
 * Relative tolerance for plane-side tests (faces of curved meshes are not
 * exactly planar).
 */
const PLANE_EPS = 1e-6;
/**
 * Overlap (px) below which two screen polygons only touch, e.g. along a
 * shared edge.
 */
const TOUCH_EPS = 1e-3;

/**
 * Pairs `[behind, inFront]` of items whose faces overlap on screen and whose
 * planes separate them. Items without a surface are ignored.
 */
export function occlusionPairs(
  items: readonly DepthItem[],
): [number, number][] {
  const faces = items
    .map((item, index) => facePlane(index, item))
    .filter((face) => face !== null)
    .sort((a, b) => a.minX - b.minX);
  const pairs: [number, number][] = [];
  faces.forEach((p, i) => {
    // Sweep: only faces starting left of p's right edge can overlap it.
    for (let j = i + 1; j < faces.length; j++) {
      const q = faces[j];
      if (q.minX >= p.maxX - TOUCH_EPS) {
        break;
      }
      const pair = occlusionPair(p, q);
      if (pair) {
        pairs.push(pair);
      }
    }
  });
  return pairs;
}

/** `[behind, inFront]` for two faces, if they overlap and can be ordered. */
function occlusionPair(p: FacePlane, q: FacePlane): [number, number] | null {
  const apart = q.minY >= p.maxY - TOUCH_EPS || p.minY >= q.maxY - TOUCH_EPS;
  if (apart || !screenOverlap(p.screen, q.screen)) {
    return null;
  }
  const pBehind = isBehind(p, q);
  const qBehind = isBehind(q, p);
  if (pBehind === qBehind) {
    return null; // coplanar, intersecting or undecidable
  }
  return pBehind ? [p.index, q.index] : [q.index, p.index];
}

/** Plane and screen bounds of an item's face, or `null` without a surface. */
function facePlane(index: number, item: DepthItem): FacePlane | null {
  const { polygon, screen } = item;
  if (!polygon || !screen || polygon.length < 3 || screen.length < 6) {
    return null;
  }
  const normal = newell(polygon);
  const len = Math.hypot(...normal);
  if (len === 0) {
    return null;
  }
  const [nx, ny, nz] = normal.map((v) => v / len);
  const center = centroid(polygon);
  const d = nx * center[0] + ny * center[1] + nz * center[2];
  // Camera at the origin: its signed distance to the plane is −d.
  const tolerance = PLANE_EPS * Math.hypot(...center);
  const eye = Math.abs(d) <= tolerance ? 0 : -Math.sign(d);
  const xs = screen.filter((_, i) => i % 2 === 0);
  const ys = screen.filter((_, i) => i % 2 === 1);
  return {
    index,
    polygon,
    screen,
    nx,
    ny,
    nz,
    d,
    eye,
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/** Newell normal (not normalized) of a view-space polygon. */
function newell(polygon: Vec3[]): [number, number, number] {
  const n: [number, number, number] = [0, 0, 0];
  polygon.forEach((a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    n[0] += (a.y - b.y) * (a.z + b.z);
    n[1] += (a.z - b.z) * (a.x + b.x);
    n[2] += (a.x - b.x) * (a.y + b.y);
  });
  return n;
}

/** Mean of the polygon's corners. */
function centroid(polygon: Vec3[]): [number, number, number] {
  const k = 1 / polygon.length;
  const sum = (axis: 'x' | 'y' | 'z'): number =>
    polygon.reduce((total, p) => total + p[axis], 0) * k;
  return [sum('x'), sum('y'), sum('z')];
}

/**
 * Does `p` lie behind `q` as seen from the camera, i.e. can `q` never be
 * hidden by `p`?
 */
function isBehind(p: FacePlane, q: FacePlane): boolean {
  // All of p on the far side of q's plane …
  if (q.eye !== 0 && allOnSide(p.polygon, q, -q.eye)) {
    return true;
  }
  // … or all of q on the camera's side of p's plane.
  return p.eye !== 0 && allOnSide(q.polygon, p, p.eye);
}

/**
 * Every point on side `side` (±1) of `plane`, or on the plane within
 * tolerance.
 */
function allOnSide(points: Vec3[], plane: FacePlane, side: number): boolean {
  return points.every((v) => {
    const dist = plane.nx * v.x + plane.ny * v.y + plane.nz * v.z - plane.d;
    const scale = 1 + Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z);
    return dist * side >= -PLANE_EPS * scale;
  });
}

/**
 * Separating axis test for two convex screen polygons (flat point arrays).
 * Polygons that only touch count as not overlapping. Non-convex input errs
 * towards "overlapping".
 */
function screenOverlap(a: number[], b: number[]): boolean {
  return !hasSeparatingEdge(a, b) && !hasSeparatingEdge(b, a);
}

/** Whether an edge normal of `a` separates the two polygons. */
function hasSeparatingEdge(a: number[], b: number[]): boolean {
  const n = a.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ex = a[j * 2] - a[i * 2];
    const ey = a[j * 2 + 1] - a[i * 2 + 1];
    const len = Math.hypot(ex, ey);
    if (len === 0) {
      continue;
    }
    // Axis perpendicular to the edge, in pixels.
    const [minA, maxA] = projectOnAxis(a, -ey / len, ex / len);
    const [minB, maxB] = projectOnAxis(b, -ey / len, ex / len);
    if (maxA <= minB + TOUCH_EPS || maxB <= minA + TOUCH_EPS) {
      return true;
    }
  }
  return false;
}

/** Interval covered by the points projected onto the axis `(ax, ay)`. */
function projectOnAxis(
  points: number[],
  ax: number,
  ay: number,
): [number, number] {
  const ts: number[] = [];
  for (let i = 0; i < points.length; i += 2) {
    ts.push(points[i] * ax + points[i + 1] * ay);
  }
  return [Math.min(...ts), Math.max(...ts)];
}

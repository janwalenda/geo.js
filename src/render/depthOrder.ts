import type { Vec3 } from '../math/Vec3';

/** One unit of the painter's algorithm, e.g. a face with all the primitives it emitted. */
export interface DepthItem {
    /** Distance from the camera (larger = farther). Used where occlusion does not decide. */
    depth: number;
    /**
     * View-space corners of a (nearly) planar polygon, camera at the origin – or `null`
     * for items without a surface (lines, points), which are ordered by `depth` only.
     */
    polygon: Vec3[] | null;
    /** The same polygon projected to the screen, flat `[x0, y0, x1, y1, …]`. */
    screen: number[] | null;
}

interface Face {
    index: number;
    polygon: Vec3[];
    screen: number[];
    /** Plane `n·p = d` (unit normal), and the side the camera (origin) is on: −1, 0 or 1. */
    nx: number;
    ny: number;
    nz: number;
    d: number;
    eye: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

/** Relative tolerance for plane-side tests (faces of curved meshes are not exactly planar). */
const PLANE_EPS = 1e-6;
/** Overlap (px) below which two screen polygons only touch, e.g. along a shared edge. */
const TOUCH_EPS = 1e-3;

/**
 * Back-to-front draw order (indices into `items`) for the painter's algorithm.
 *
 * Sorting by depth alone fails for faces of very different size: a large floor tile in
 * front of an object can have its center nearer to the camera than the object's faces,
 * and would be painted over them. So wherever two faces overlap on screen, their planes
 * decide which one occludes the other (as in Newell's algorithm) and the order is a
 * topological sort of these constraints. Pairs the planes cannot separate (intersecting
 * faces) and cycles fall back to the depth order. Pure function, `items` is not modified.
 */
export function depthOrder(items: readonly DepthItem[]): number[] {
    const n = items.length;
    // rank = position in plain depth order (stable: equal depths keep input order).
    const byDepth = items.map((_, i) => i).sort((a, b) => items[b].depth - items[a].depth || a - b);
    const rank = new Array<number>(n);
    byDepth.forEach((item, r) => { rank[item] = r; });

    const successors: number[][] = items.map(() => []);
    const indegree = new Array<number>(n).fill(0);
    for (const [a, b] of occlusionPairs(items)) {
        successors[a].push(b);
        indegree[b]++;
    }

    // Kahn's algorithm, always taking the farthest ready item; on a cycle, force the farthest remaining one.
    const order: number[] = [];
    const done = new Array<boolean>(n).fill(false);
    const ready = new RankHeap(rank);
    for (let i = 0; i < n; i++) if (indegree[i] === 0) ready.push(i);
    let fallback = 0;
    while (order.length < n) {
        let next = ready.pop();
        while (next !== undefined && done[next]) next = ready.pop();
        if (next === undefined) {
            while (done[byDepth[fallback]]) fallback++;
            next = byDepth[fallback];
        }
        done[next] = true;
        order.push(next);
        for (const s of successors[next]) {
            if (--indegree[s] === 0 && !done[s]) ready.push(s);
        }
    }
    return order;
}

/** Pairs `[behind, inFront]` of faces that overlap on screen and whose planes separate them. */
function occlusionPairs(items: readonly DepthItem[]): [number, number][] {
    const faces: Face[] = [];
    items.forEach((item, index) => {
        const face = item.polygon && item.screen ? makeFace(index, item.polygon, item.screen) : null;
        if (face) faces.push(face);
    });
    faces.sort((a, b) => a.minX - b.minX);

    const pairs: [number, number][] = [];
    for (let i = 0; i < faces.length; i++) {
        const p = faces[i];
        for (let j = i + 1; j < faces.length && faces[j].minX < p.maxX - TOUCH_EPS; j++) {
            const q = faces[j];
            if (q.minY >= p.maxY - TOUCH_EPS || p.minY >= q.maxY - TOUCH_EPS) continue;
            if (!screenOverlap(p.screen, q.screen)) continue;
            const pBehind = isBehind(p, q);
            const qBehind = isBehind(q, p);
            if (pBehind && !qBehind) pairs.push([p.index, q.index]);
            else if (qBehind && !pBehind) pairs.push([q.index, p.index]);
        }
    }
    return pairs;
}

function makeFace(index: number, polygon: Vec3[], screen: number[]): Face | null {
    if (polygon.length < 3 || screen.length < 6) return null;
    // Newell normal and centroid of the view-space polygon.
    let nx = 0, ny = 0, nz = 0, cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i];
        const b = polygon[(i + 1) % polygon.length];
        nx += (a.y - b.y) * (a.z + b.z);
        ny += (a.z - b.z) * (a.x + b.x);
        nz += (a.x - b.x) * (a.y + b.y);
        cx += a.x;
        cy += a.y;
        cz += a.z;
    }
    const len = Math.hypot(nx, ny, nz);
    if (len === 0) return null;
    nx /= len;
    ny /= len;
    nz /= len;
    const k = 1 / polygon.length;
    const d = (nx * cx + ny * cy + nz * cz) * k;
    const scale = Math.hypot(cx, cy, cz) * k;
    // Camera at the origin: its signed distance to the plane is −d.
    const eye = Math.abs(d) <= PLANE_EPS * scale ? 0 : -Math.sign(d);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < screen.length; i += 2) {
        minX = Math.min(minX, screen[i]);
        maxX = Math.max(maxX, screen[i]);
        minY = Math.min(minY, screen[i + 1]);
        maxY = Math.max(maxY, screen[i + 1]);
    }
    return { index, polygon, screen, nx, ny, nz, d, eye, minX, maxX, minY, maxY };
}

/** Does `p` lie behind `q` as seen from the camera, i.e. can `q` never be hidden by `p`? */
function isBehind(p: Face, q: Face): boolean {
    // All of p on the far side of q's plane …
    if (q.eye !== 0 && allOnSide(p.polygon, q, -q.eye)) return true;
    // … or all of q on the camera's side of p's plane.
    return p.eye !== 0 && allOnSide(q.polygon, p, p.eye);
}

/** Every point on side `side` (±1) of `plane`, or on the plane within tolerance. */
function allOnSide(points: Vec3[], plane: Face, side: number): boolean {
    for (const v of points) {
        const dist = plane.nx * v.x + plane.ny * v.y + plane.nz * v.z - plane.d;
        const eps = PLANE_EPS * (1 + Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z));
        if (dist * side < -eps) return false;
    }
    return true;
}

/**
 * Separating axis test for two convex screen polygons (flat point arrays). Polygons that
 * only touch count as not overlapping. Non-convex input errs towards "overlapping".
 */
function screenOverlap(a: number[], b: number[]): boolean {
    return !hasSeparatingEdge(a, b) && !hasSeparatingEdge(b, a);
}

function hasSeparatingEdge(a: number[], b: number[]): boolean {
    const n = a.length / 2;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const ex = a[j * 2] - a[i * 2], ey = a[j * 2 + 1] - a[i * 2 + 1];
        const len = Math.hypot(ex, ey);
        if (len === 0) continue;
        // Axis perpendicular to the edge, in pixels.
        const ax = -ey / len, ay = ex / len;
        const [minA, maxA] = projectOnAxis(a, ax, ay);
        const [minB, maxB] = projectOnAxis(b, ax, ay);
        if (maxA <= minB + TOUCH_EPS || maxB <= minA + TOUCH_EPS) return true;
    }
    return false;
}

function projectOnAxis(points: number[], ax: number, ay: number): [number, number] {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
        const t = points[i] * ax + points[i + 1] * ay;
        if (t < min) min = t;
        if (t > max) max = t;
    }
    return [min, max];
}

/** Binary min-heap of item indices, keyed by their depth rank (farthest first). */
class RankHeap {
    private readonly heap: number[] = [];

    constructor(private readonly rank: number[]) {}

    push(item: number): void {
        const { heap, rank } = this;
        heap.push(item);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (rank[heap[parent]] <= rank[item]) break;
            heap[i] = heap[parent];
            i = parent;
        }
        heap[i] = item;
    }

    pop(): number | undefined {
        const { heap, rank } = this;
        if (heap.length === 0) return undefined;
        const top = heap[0];
        const last = heap.pop() as number;
        if (heap.length > 0) {
            let i = 0;
            for (;;) {
                const l = i * 2 + 1, r = l + 1;
                let m = i;
                let mRank = rank[last];
                if (l < heap.length && rank[heap[l]] < mRank) { m = l; mRank = rank[heap[l]]; }
                if (r < heap.length && rank[heap[r]] < mRank) m = r;
                if (m === i) break;
                heap[i] = heap[m];
                i = m;
            }
            heap[i] = last;
        }
        return top;
    }
}

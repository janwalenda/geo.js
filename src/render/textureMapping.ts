import type { AffineMatrix } from './DisplayList';

/**
 * The affine map that sends the texture triangle `(u0, v0), (u1, v1), (u2, v2)` onto
 * the screen triangle `(x0, y0), (x1, y1), (x2, y2)`, as `[a, b, c, d, e, f]` with
 * `x = a·u + c·v + e`, `y = b·u + d·v + f`. Returns `null` if the texture triangle is
 * degenerate (zero area). Both inputs are flat arrays of three points.
 */
export function affineFromTriangle(uv: ArrayLike<number>, xy: ArrayLike<number>): AffineMatrix | null {
    const du1 = uv[2] - uv[0], dv1 = uv[3] - uv[1];
    const du2 = uv[4] - uv[0], dv2 = uv[5] - uv[1];
    const det = du1 * dv2 - du2 * dv1;
    if (Math.abs(det) < 1e-12) return null;
    const dx1 = xy[2] - xy[0], dy1 = xy[3] - xy[1];
    const dx2 = xy[4] - xy[0], dy2 = xy[5] - xy[1];
    const a = (dx1 * dv2 - dx2 * dv1) / det;
    const b = (dy1 * dv2 - dy2 * dv1) / det;
    const c = (dx2 * du1 - dx1 * du2) / det;
    const d = (dy2 * du1 - dy1 * du2) / det;
    return [a, b, c, d, xy[0] - a * uv[0] - c * uv[1], xy[1] - b * uv[0] - d * uv[1]];
}

/**
 * Grow a convex polygon (flat screen points) by pushing every edge `amount` pixels
 * outwards (miter offset, capped at `4 · amount` per corner so slivers do not spike).
 * Slightly overlapping clip regions hide the anti-aliasing seams between neighbouring
 * textured triangles. Returns a new array; the input is not modified.
 */
export function inflatePolygon(points: number[], amount: number): number[] {
    const n = points.length / 2;
    if (amount <= 0 || n < 3) return points;
    let area = 0;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i * 2] * points[j * 2 + 1] - points[j * 2] * points[i * 2 + 1];
    }
    if (area === 0) return points;
    const sign = area > 0 ? 1 : -1;
    // Outward unit normal of edge i → i+1.
    const nx = new Array<number>(n), ny = new Array<number>(n);
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const dx = points[j * 2] - points[i * 2], dy = points[j * 2 + 1] - points[i * 2 + 1];
        const len = Math.hypot(dx, dy) || 1;
        nx[i] = (sign * dy) / len;
        ny[i] = (-sign * dx) / len;
    }
    const out = new Array<number>(points.length);
    const cap = 4 * amount;
    for (let i = 0; i < n; i++) {
        const k = (i + n - 1) % n; // edge ending at vertex i
        // Corner offset m with m·n_k = m·n_i = amount: m = amount · (n_k + n_i) / (1 + n_k·n_i).
        const denom = 1 + nx[k] * nx[i] + ny[k] * ny[i];
        let mx = denom > 1e-9 ? (amount * (nx[k] + nx[i])) / denom : nx[i] * amount;
        let my = denom > 1e-9 ? (amount * (ny[k] + ny[i])) / denom : ny[i] * amount;
        const len = Math.hypot(mx, my);
        if (len > cap) {
            mx *= cap / len;
            my *= cap / len;
        }
        out[i * 2] = points[i * 2] + mx;
        out[i * 2 + 1] = points[i * 2 + 1] + my;
    }
    return out;
}

/**
 * Subdivisions per edge for `'auto'` texture detail. The error of affine mapping grows
 * with the depth ratio of the triangle's corners (distances in front of the camera),
 * so near, steep triangles get more pieces. Result in [1, 8].
 */
export function autoTextureDetail(nearest: number, farthest: number): number {
    if (nearest <= 0) return 8;
    return Math.min(8, Math.max(1, Math.ceil((farthest / nearest - 1) * 12)));
}

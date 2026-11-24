import type { Basis, Mat4Minors } from './types';
import { Vec3 } from './Vec3';

/**
 * The 2×2 minors of the column-major 4×4 matrix `a` (see
 * {@link Mat4Minors}).
 */
export function mat4Minors(a: ArrayLike<number>): Mat4Minors {
  return [
    a[0] * a[5] - a[1] * a[4],
    a[0] * a[6] - a[2] * a[4],
    a[0] * a[7] - a[3] * a[4],
    a[1] * a[6] - a[2] * a[5],
    a[1] * a[7] - a[3] * a[5],
    a[2] * a[7] - a[3] * a[6],
    a[8] * a[13] - a[9] * a[12],
    a[8] * a[14] - a[10] * a[12],
    a[8] * a[15] - a[11] * a[12],
    a[9] * a[14] - a[10] * a[13],
    a[9] * a[15] - a[11] * a[13],
    a[10] * a[15] - a[11] * a[14],
  ];
}

/** Determinant of a 4×4 matrix from its {@link mat4Minors}. */
export function determinantFromMinors(b: Mat4Minors): number {
  return (
    b[0] * b[11] -
    b[1] * b[10] +
    b[2] * b[9] +
    b[3] * b[8] -
    b[4] * b[7] +
    b[5] * b[6]
  );
}

/**
 * Invert the column-major 4×4 matrix `a` in place (adjugate / determinant).
 * A singular matrix becomes the zero matrix.
 */
export function invertMat4(a: Float64Array): void {
  const b = mat4Minors(a);
  const det = determinantFromMinors(b);
  if (det === 0) {
    a.fill(0);
    return;
  }
  const m = Array.from(a);
  const inv = 1 / det;
  a[0] = (m[5] * b[11] - m[6] * b[10] + m[7] * b[9]) * inv;
  a[1] = (m[2] * b[10] - m[1] * b[11] - m[3] * b[9]) * inv;
  a[2] = (m[13] * b[5] - m[14] * b[4] + m[15] * b[3]) * inv;
  a[3] = (m[10] * b[4] - m[9] * b[5] - m[11] * b[3]) * inv;
  a[4] = (m[6] * b[8] - m[4] * b[11] - m[7] * b[7]) * inv;
  a[5] = (m[0] * b[11] - m[2] * b[8] + m[3] * b[7]) * inv;
  a[6] = (m[14] * b[2] - m[12] * b[5] - m[15] * b[1]) * inv;
  a[7] = (m[8] * b[5] - m[10] * b[2] + m[11] * b[1]) * inv;
  a[8] = (m[4] * b[10] - m[5] * b[8] + m[7] * b[6]) * inv;
  a[9] = (m[1] * b[8] - m[0] * b[10] - m[3] * b[6]) * inv;
  a[10] = (m[12] * b[4] - m[13] * b[2] + m[15] * b[0]) * inv;
  a[11] = (m[9] * b[2] - m[8] * b[4] - m[11] * b[0]) * inv;
  a[12] = (m[5] * b[7] - m[4] * b[9] - m[6] * b[6]) * inv;
  a[13] = (m[0] * b[9] - m[1] * b[7] + m[2] * b[6]) * inv;
  a[14] = (m[13] * b[1] - m[12] * b[3] - m[14] * b[0]) * inv;
  a[15] = (m[8] * b[3] - m[9] * b[1] + m[10] * b[0]) * inv;
}

/** `1 / v`, or 0 for `v = 0` (e.g. a collapsed scale axis). */
export function reciprocal(v: number): number {
  return v === 0 ? 0 : 1 / v;
}

/**
 * Orthonormal camera basis for an eye at `eye` looking at `target`: z points
 * from target to eye, x to the right, y up (approximately along `up`).
 */
export function lookAtBasis(eye: Vec3, target: Vec3, up: Vec3): Basis {
  const z = Vec3.sub(eye, target);
  if (z.lengthSq() === 0) {
    z.set(0, 0, 1);
  }
  z.normalize();

  let x = Vec3.cross(up, z);
  if (x.lengthSq() === 0) {
    // `up` is parallel to the view direction: nudge z to get a valid basis.
    const nudged = z.clone();
    if (Math.abs(up.z) === 1) {
      nudged.x += 1e-4;
    } else {
      nudged.z += 1e-4;
    }
    x = Vec3.cross(up, nudged.normalize());
  }
  x.normalize();
  const y = Vec3.cross(z, x);
  return { x, y, z };
}

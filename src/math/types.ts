import type { Vec3 } from './Vec3';

/**
 * Order in which Euler rotations are composed; 'XYZ' means R = Rx · Ry · Rz.
 */
export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';

/** One row of a 4×4 matrix, left to right. */
export type Mat4Row = readonly [number, number, number, number];

/**
 * The twelve 2×2 minors of a 4×4 matrix that its determinant and inverse
 * are built from (Laplace expansion along the first two columns).
 */
export type Mat4Minors = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/** Orthonormal basis; for a camera: x right, y up, z backwards. */
export interface Basis {
  x: Vec3;
  y: Vec3;
  z: Vec3;
}

import type { Mat4 } from './Mat4';
import type { EulerOrder } from './types';
import { EPSILON } from './utils';
import type { Vec3 } from './Vec3';

/**
 * Rotation quaternion (x, y, z, w) with w as the scalar part.
 * Methods mutate `this` and return it for chaining.
 */
export class Quat {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
    public w = 1,
  ) {}

  /**
   * Set all components (`w` is the scalar part). Mutates and returns `this`.
   */
  set(x: number, y: number, z: number, w: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  /** Reset to the identity rotation. Mutates and returns `this`. */
  identity(): this {
    return this.set(0, 0, 0, 1);
  }

  /** Copy all components of `q`. Mutates and returns `this`. */
  copy(q: Quat): this {
    return this.set(q.x, q.y, q.z, q.w);
  }

  /** A new, independent copy. */
  clone(): Quat {
    return new Quat(this.x, this.y, this.z, this.w);
  }

  /** Rotation of `angle` radians around `axis` (normalized internally). */
  setFromAxisAngle(axis: Vec3, angle: number): this {
    const len = Math.hypot(axis.x, axis.y, axis.z);
    if (len === 0) {
      return this.identity();
    }
    const s = Math.sin(angle / 2) / len;
    return this.set(axis.x * s, axis.y * s, axis.z * s, Math.cos(angle / 2));
  }

  /** Euler angles in radians, composed in the given order (default 'XYZ'). */
  setFromEuler(
    x: number,
    y: number,
    z: number,
    order: EulerOrder = 'XYZ',
  ): this {
    const parts: Record<string, Quat> = {
      X: new Quat(Math.sin(x / 2), 0, 0, Math.cos(x / 2)),
      Y: new Quat(0, Math.sin(y / 2), 0, Math.cos(y / 2)),
      Z: new Quat(0, 0, Math.sin(z / 2), Math.cos(z / 2)),
    };
    this.copy(parts[order[0]]);
    this.multiply(parts[order[1]]);
    return this.multiply(parts[order[2]]);
  }

  /**
   * Extract the rotation from the upper-left 3×3 block of a pure rotation
   * matrix.
   */
  setFromRotationMatrix(m: Mat4): this {
    const e = m.elements;
    const m11 = e[0],
      m12 = e[4],
      m13 = e[8];
    const m21 = e[1],
      m22 = e[5],
      m23 = e[9];
    const m31 = e[2],
      m32 = e[6],
      m33 = e[10];
    const trace = m11 + m22 + m33;

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1);
      return this.set(
        (m32 - m23) * s,
        (m13 - m31) * s,
        (m21 - m12) * s,
        0.25 / s,
      );
    }
    if (m11 > m22 && m11 > m33) {
      const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
      return this.set(
        0.25 * s,
        (m12 + m21) / s,
        (m13 + m31) / s,
        (m32 - m23) / s,
      );
    }
    if (m22 > m33) {
      const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
      return this.set(
        (m12 + m21) / s,
        0.25 * s,
        (m23 + m32) / s,
        (m13 - m31) / s,
      );
    }
    const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
    return this.set(
      (m13 + m31) / s,
      (m23 + m32) / s,
      0.25 * s,
      (m21 - m12) / s,
    );
  }

  /** this = a · b (b is applied first). */
  multiplyQuats(a: Quat, b: Quat): this {
    const ax = a.x,
      ay = a.y,
      az = a.z,
      aw = a.w;
    const bx = b.x,
      by = b.y,
      bz = b.z,
      bw = b.w;
    return this.set(
      ax * bw + aw * bx + ay * bz - az * by,
      ay * bw + aw * by + az * bx - ax * bz,
      az * bw + aw * bz + ax * by - ay * bx,
      aw * bw - ax * bx - ay * by - az * bz,
    );
  }

  /** this = this · q (q is applied first, i.e. in local space). */
  multiply(q: Quat): this {
    return this.multiplyQuats(this, q);
  }

  /** this = q · this (q is applied last, i.e. in parent space). */
  premultiply(q: Quat): this {
    return this.multiplyQuats(q, this);
  }

  /** Dot product of the four components with `q`. */
  dot(q: Quat): number {
    return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
  }

  /** Norm of the quaternion (1 for rotations). */
  length(): number {
    return Math.hypot(this.x, this.y, this.z, this.w);
  }

  /**
   * Scale to unit length (identity for a zero quaternion). Mutates and returns
   * `this`.
   */
  normalize(): this {
    const len = this.length();
    if (len === 0) {
      return this.identity();
    }
    return this.set(this.x / len, this.y / len, this.z / len, this.w / len);
  }

  /**
   * Negate the vector part (the inverse rotation for unit quaternions). Mutates
   * and returns `this`.
   */
  conjugate(): this {
    return this.set(-this.x, -this.y, -this.z, this.w);
  }

  /**
   * Multiplicative inverse (identity for a zero quaternion). Mutates and
   * returns `this`.
   */
  invert(): this {
    const lenSq = this.dot(this);
    if (lenSq === 0) {
      return this.identity();
    }
    return this.set(
      -this.x / lenSq,
      -this.y / lenSq,
      -this.z / lenSq,
      this.w / lenSq,
    );
  }

  /** Spherical linear interpolation towards `q` (shortest path). */
  slerp(q: Quat, t: number): this {
    let cos = this.dot(q);
    let bx = q.x,
      by = q.y,
      bz = q.z,
      bw = q.w;
    if (cos < 0) {
      cos = -cos;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    if (cos > 1 - EPSILON) {
      // Nearly identical: linear interpolation is accurate and avoids division
      // by ~0.
      return this.set(
        this.x + (bx - this.x) * t,
        this.y + (by - this.y) * t,
        this.z + (bz - this.z) * t,
        this.w + (bw - this.w) * t,
      ).normalize();
    }
    const theta = Math.acos(cos);
    const sin = Math.sin(theta);
    const wa = Math.sin((1 - t) * theta) / sin;
    const wb = Math.sin(t * theta) / sin;
    return this.set(
      this.x * wa + bx * wb,
      this.y * wa + by * wb,
      this.z * wa + bz * wb,
      this.w * wa + bw * wb,
    );
  }

  /** Angle in radians between the two rotations. */
  angleTo(q: Quat): number {
    return 2 * Math.acos(Math.min(1, Math.abs(this.dot(q))));
  }

  /** Equal as rotations (q and −q represent the same rotation). */
  equals(q: Quat, epsilon = EPSILON): boolean {
    return 1 - Math.abs(this.dot(q)) <= epsilon;
  }

  /** Components `[x, y, z, w]` as a new array. */
  toArray(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }
}

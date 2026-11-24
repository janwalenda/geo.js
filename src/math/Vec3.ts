import type { Mat3 } from './Mat3';
import type { Mat4 } from './Mat4';
import type { Quat } from './Quat';
import { EPSILON } from './utils';

/**
 * 3D vector. All instance methods mutate `this` and return it for chaining;
 * call {@link Vec3.clone} first if the original must be kept.
 * Static helpers always return a new vector.
 */
export class Vec3 {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
  ) {}

  /** a + b as a new vector. */
  static add(a: Vec3, b: Vec3): Vec3 {
    return a.clone().add(b);
  }

  /** a − b as a new vector. */
  static sub(a: Vec3, b: Vec3): Vec3 {
    return a.clone().sub(b);
  }

  /** a × b as a new vector. */
  static cross(a: Vec3, b: Vec3): Vec3 {
    return a.clone().cross(b);
  }

  /** Set all components. Mutates and returns `this`. */
  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /** Copy all components of `v`. Mutates and returns `this`. */
  copy(v: Vec3): this {
    return this.set(v.x, v.y, v.z);
  }

  /** A new, independent copy. */
  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  /** Add `v` component-wise. Mutates and returns `this`. */
  add(v: Vec3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  /** Subtract `v` component-wise. Mutates and returns `this`. */
  sub(v: Vec3): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /** Multiply every component by `s`. Mutates and returns `this`. */
  scale(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  /** Component-wise multiplication. */
  multiply(v: Vec3): this {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  /** Flip the sign of every component. Mutates and returns `this`. */
  negate(): this {
    return this.scale(-1);
  }

  /** Dot product with `v`. */
  dot(v: Vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /** this = this × v (right-handed). */
  cross(v: Vec3): this {
    const { x, y, z } = this;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }

  /** Squared length (cheaper than {@link length}). */
  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /** Euclidean length. */
  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  /** Scale to unit length. A zero vector stays zero. */
  normalize(): this {
    const len = this.length();
    return len > 0 ? this.scale(1 / len) : this;
  }

  /** Euclidean distance to the point `v`. */
  distanceTo(v: Vec3): number {
    return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * Linear interpolation towards `v` by `t` (0 = this, 1 = `v`). Mutates and
   * returns `this`.
   */
  lerp(v: Vec3, t: number): this {
    this.x += (v.x - this.x) * t;
    this.y += (v.y - this.y) * t;
    this.z += (v.z - this.z) * t;
    return this;
  }

  /** this = m · this. */
  applyMat3(m: Mat3): this {
    const e = m.elements;
    const { x, y, z } = this;
    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;
    return this;
  }

  /** Transform as a point (w = 1), including the perspective divide. */
  applyMat4(m: Mat4): this {
    const e = m.elements;
    const { x, y, z } = this;
    const w = e[3] * x + e[7] * y + e[11] * z + e[15] || 1;
    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) / w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) / w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) / w;
    return this;
  }

  /** Transform as a direction (w = 0, translation ignored) and normalize. */
  transformDirection(m: Mat4): this {
    const e = m.elements;
    const { x, y, z } = this;
    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;
    return this.normalize();
  }

  /** Rotate by a unit quaternion. */
  applyQuat(q: Quat): this {
    const { x, y, z } = this;
    const tx = 2 * (q.y * z - q.z * y);
    const ty = 2 * (q.z * x - q.x * z);
    const tz = 2 * (q.x * y - q.y * x);
    this.x = x + q.w * tx + q.y * tz - q.z * ty;
    this.y = y + q.w * ty + q.z * tx - q.x * tz;
    this.z = z + q.w * tz + q.x * ty - q.y * tx;
    return this;
  }

  /** Component-wise comparison with a tolerance of `epsilon`. */
  equals(v: Vec3, epsilon = EPSILON): boolean {
    return (
      Math.abs(this.x - v.x) <= epsilon &&
      Math.abs(this.y - v.y) <= epsilon &&
      Math.abs(this.z - v.z) <= epsilon
    );
  }

  /** Components as a new array. */
  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }
}

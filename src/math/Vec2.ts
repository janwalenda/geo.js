import type { Mat3 } from './Mat3';
import { EPSILON } from './utils';

/**
 * 2D vector. All instance methods mutate `this` and return it for chaining;
 * call {@link Vec2.clone} first if the original must be kept.
 */
export class Vec2 {
    constructor(public x = 0, public y = 0) {}

    set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v: Vec2): this {
        return this.set(v.x, v.y);
    }

    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    add(v: Vec2): this {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v: Vec2): this {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scale(s: number): this {
        this.x *= s;
        this.y *= s;
        return this;
    }

    negate(): this {
        return this.scale(-1);
    }

    dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y;
    }

    /** z-component of the 3D cross product; > 0 if `v` is counter-clockwise from `this`. */
    cross(v: Vec2): number {
        return this.x * v.y - this.y * v.x;
    }

    lengthSq(): number {
        return this.x * this.x + this.y * this.y;
    }

    length(): number {
        return Math.sqrt(this.lengthSq());
    }

    /** Scale to unit length. A zero vector stays zero. */
    normalize(): this {
        const len = this.length();
        return len > 0 ? this.scale(1 / len) : this;
    }

    distanceTo(v: Vec2): number {
        return Math.hypot(this.x - v.x, this.y - v.y);
    }

    lerp(v: Vec2, t: number): this {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        return this;
    }

    /** Rotate counter-clockwise by `angle` radians around `center` (default: origin). */
    rotate(angle: number, center?: Vec2): this {
        const cx = center?.x ?? 0;
        const cy = center?.y ?? 0;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const dx = this.x - cx;
        const dy = this.y - cy;
        this.x = cx + dx * c - dy * s;
        this.y = cy + dx * s + dy * c;
        return this;
    }

    /** Transform as a point by a 2D affine/projective 3×3 matrix (homogeneous w = 1). */
    applyMat3(m: Mat3): this {
        const e = m.elements;
        const x = this.x;
        const y = this.y;
        const w = e[2] * x + e[5] * y + e[8] || 1;
        this.x = (e[0] * x + e[3] * y + e[6]) / w;
        this.y = (e[1] * x + e[4] * y + e[7]) / w;
        return this;
    }

    equals(v: Vec2, epsilon = EPSILON): boolean {
        return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
    }

    toArray(): [number, number] {
        return [this.x, this.y];
    }
}

import type { Mat4 } from './Mat4';
import type { Vec3 } from './Vec3';
import { EPSILON } from './utils';

/** Homogeneous 4D vector, mainly used for clip-space coordinates. Methods mutate `this`. */
export class Vec4 {
    constructor(public x = 0, public y = 0, public z = 0, public w = 1) {}

    set(x: number, y: number, z: number, w: number): this {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    /** Set from a 3D vector and an explicit w (1 = point, 0 = direction). */
    setFromVec3(v: Vec3, w = 1): this {
        return this.set(v.x, v.y, v.z, w);
    }

    copy(v: Vec4): this {
        return this.set(v.x, v.y, v.z, v.w);
    }

    clone(): Vec4 {
        return new Vec4(this.x, this.y, this.z, this.w);
    }

    /** this = m · this (no perspective divide). */
    applyMat4(m: Mat4): this {
        const e = m.elements;
        const { x, y, z, w } = this;
        this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
        this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
        this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
        this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
        return this;
    }

    equals(v: Vec4, epsilon = EPSILON): boolean {
        return (
            Math.abs(this.x - v.x) <= epsilon &&
            Math.abs(this.y - v.y) <= epsilon &&
            Math.abs(this.z - v.z) <= epsilon &&
            Math.abs(this.w - v.w) <= epsilon
        );
    }

    toArray(): [number, number, number, number] {
        return [this.x, this.y, this.z, this.w];
    }
}

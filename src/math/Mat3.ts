import type { Mat4 } from './Mat4';
import { EPSILON } from './utils';

/**
 * 3×3 matrix, stored column-major in {@link Mat3.elements} (`elements[col * 3 + row]`).
 * Used for normal matrices and 2D affine transforms. Methods mutate `this`.
 */
export class Mat3 {
    readonly elements = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

    /** Set all elements, given in **row-major** order for readability. */
    set(
        n11: number, n12: number, n13: number,
        n21: number, n22: number, n23: number,
        n31: number, n32: number, n33: number,
    ): this {
        const e = this.elements;
        e[0] = n11; e[3] = n12; e[6] = n13;
        e[1] = n21; e[4] = n22; e[7] = n23;
        e[2] = n31; e[5] = n32; e[8] = n33;
        return this;
    }

    identity(): this {
        return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
    }

    copy(m: Mat3): this {
        this.elements.set(m.elements);
        return this;
    }

    clone(): Mat3 {
        return new Mat3().copy(this);
    }

    /** this = a · b */
    multiplyMatrices(a: Mat3, b: Mat3): this {
        const ae = a.elements;
        const be = b.elements;
        const out = new Float64Array(9);
        for (let col = 0; col < 3; col++) {
            for (let row = 0; row < 3; row++) {
                out[col * 3 + row] =
                    ae[row] * be[col * 3] +
                    ae[3 + row] * be[col * 3 + 1] +
                    ae[6 + row] * be[col * 3 + 2];
            }
        }
        this.elements.set(out);
        return this;
    }

    /** this = this · m (m is applied first). */
    multiply(m: Mat3): this {
        return this.multiplyMatrices(this, m);
    }

    /** this = m · this (m is applied last). */
    premultiply(m: Mat3): this {
        return this.multiplyMatrices(m, this);
    }

    determinant(): number {
        const e = this.elements;
        return (
            e[0] * (e[4] * e[8] - e[7] * e[5]) -
            e[3] * (e[1] * e[8] - e[7] * e[2]) +
            e[6] * (e[1] * e[5] - e[4] * e[2])
        );
    }

    /** Invert in place. A singular matrix becomes the zero matrix. */
    invert(): this {
        const e = this.elements;
        const n11 = e[0], n21 = e[1], n31 = e[2];
        const n12 = e[3], n22 = e[4], n32 = e[5];
        const n13 = e[6], n23 = e[7], n33 = e[8];

        const t11 = n33 * n22 - n32 * n23;
        const t12 = n32 * n13 - n33 * n12;
        const t13 = n23 * n12 - n22 * n13;
        const det = n11 * t11 + n21 * t12 + n31 * t13;

        if (det === 0) {
            e.fill(0);
            return this;
        }
        const inv = 1 / det;
        e[0] = t11 * inv;
        e[1] = (n31 * n23 - n33 * n21) * inv;
        e[2] = (n32 * n21 - n31 * n22) * inv;
        e[3] = t12 * inv;
        e[4] = (n33 * n11 - n31 * n13) * inv;
        e[5] = (n31 * n12 - n32 * n11) * inv;
        e[6] = t13 * inv;
        e[7] = (n21 * n13 - n23 * n11) * inv;
        e[8] = (n22 * n11 - n21 * n12) * inv;
        return this;
    }

    transpose(): this {
        const e = this.elements;
        let t: number;
        t = e[1]; e[1] = e[3]; e[3] = t;
        t = e[2]; e[2] = e[6]; e[6] = t;
        t = e[5]; e[5] = e[7]; e[7] = t;
        return this;
    }

    /** Take the upper-left 3×3 block of a 4×4 matrix. */
    setFromMat4(m: Mat4): this {
        const e = m.elements;
        return this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]);
    }

    /** Normal matrix: inverse transpose of the upper-left 3×3 block of `m`. */
    setNormalMatrix(m: Mat4): this {
        return this.setFromMat4(m).invert().transpose();
    }

    /** 2D translation (homogeneous). */
    makeTranslation(tx: number, ty: number): this {
        return this.set(1, 0, tx, 0, 1, ty, 0, 0, 1);
    }

    /** 2D counter-clockwise rotation by `angle` radians (homogeneous). */
    makeRotation(angle: number): this {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return this.set(c, -s, 0, s, c, 0, 0, 0, 1);
    }

    /** 2D scale (homogeneous). */
    makeScale(sx: number, sy: number): this {
        return this.set(sx, 0, 0, 0, sy, 0, 0, 0, 1);
    }

    equals(m: Mat3, epsilon = EPSILON): boolean {
        return this.elements.every((v, i) => Math.abs(v - m.elements[i]) <= epsilon);
    }
}

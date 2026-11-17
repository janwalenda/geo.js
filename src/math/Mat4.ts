import { Quat } from './Quat';
import { Vec3 } from './Vec3';
import { EPSILON } from './utils';

/**
 * 4×4 matrix, stored column-major in {@link Mat4.elements} (`elements[col * 4 + row]`),
 * acting on column vectors (`v' = M · v`). Methods mutate `this` and return it.
 *
 * Projection matrices follow the OpenGL convention: right-handed view space looking
 * down −Z, normalized device coordinates in [−1, 1] on all three axes.
 */
export class Mat4 {
    readonly elements = new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    /** Set all elements, given in **row-major** order for readability. */
    set(
        n11: number, n12: number, n13: number, n14: number,
        n21: number, n22: number, n23: number, n24: number,
        n31: number, n32: number, n33: number, n34: number,
        n41: number, n42: number, n43: number, n44: number,
    ): this {
        const e = this.elements;
        e[0] = n11; e[4] = n12; e[8] = n13; e[12] = n14;
        e[1] = n21; e[5] = n22; e[9] = n23; e[13] = n24;
        e[2] = n31; e[6] = n32; e[10] = n33; e[14] = n34;
        e[3] = n41; e[7] = n42; e[11] = n43; e[15] = n44;
        return this;
    }

    identity(): this {
        return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }

    copy(m: Mat4): this {
        this.elements.set(m.elements);
        return this;
    }

    clone(): Mat4 {
        return new Mat4().copy(this);
    }

    /** this = a · b (b is applied first). Safe if `a` or `b` is `this`. */
    multiplyMatrices(a: Mat4, b: Mat4): this {
        const ae = a.elements;
        const be = b.elements;
        const out = new Float64Array(16);
        for (let col = 0; col < 4; col++) {
            const b0 = be[col * 4], b1 = be[col * 4 + 1], b2 = be[col * 4 + 2], b3 = be[col * 4 + 3];
            for (let row = 0; row < 4; row++) {
                out[col * 4 + row] = ae[row] * b0 + ae[4 + row] * b1 + ae[8 + row] * b2 + ae[12 + row] * b3;
            }
        }
        this.elements.set(out);
        return this;
    }

    /** this = this · m (m is applied first). */
    multiply(m: Mat4): this {
        return this.multiplyMatrices(this, m);
    }

    /** this = m · this (m is applied last). */
    premultiply(m: Mat4): this {
        return this.multiplyMatrices(m, this);
    }

    makeTranslation(x: number, y: number, z: number): this {
        return this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
    }

    makeScale(x: number, y: number, z: number): this {
        return this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
    }

    /** Rotation of `angle` radians around the X axis (counter-clockwise looking down −X). */
    makeRotationX(angle: number): this {
        const c = Math.cos(angle), s = Math.sin(angle);
        return this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
    }

    makeRotationY(angle: number): this {
        const c = Math.cos(angle), s = Math.sin(angle);
        return this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
    }

    makeRotationZ(angle: number): this {
        const c = Math.cos(angle), s = Math.sin(angle);
        return this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }

    /** Rotation of `angle` radians around an arbitrary axis (Rodrigues; axis is normalized). */
    makeRotationAxis(axis: Vec3, angle: number): this {
        const len = axis.length();
        if (len === 0) return this.identity();
        const x = axis.x / len, y = axis.y / len, z = axis.z / len;
        const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
        return this.set(
            t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0,
            t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0,
            t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0,
            0, 0, 0, 1,
        );
    }

    /** Pure rotation from a unit quaternion. */
    makeRotationFromQuat(q: Quat): this {
        const { x, y, z, w } = q;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;
        return this.set(
            1 - (yy + zz), xy - wz, xz + wy, 0,
            xy + wz, 1 - (xx + zz), yz - wx, 0,
            xz - wy, yz + wx, 1 - (xx + yy), 0,
            0, 0, 0, 1,
        );
    }

    /** Matrix whose columns are the given basis vectors. */
    makeBasis(xAxis: Vec3, yAxis: Vec3, zAxis: Vec3): this {
        return this.set(
            xAxis.x, yAxis.x, zAxis.x, 0,
            xAxis.y, yAxis.y, zAxis.y, 0,
            xAxis.z, yAxis.z, zAxis.z, 0,
            0, 0, 0, 1,
        );
    }

    /** T · R · S from position, rotation and scale. */
    compose(position: Vec3, rotation: Quat, scale: Vec3): this {
        this.makeRotationFromQuat(rotation);
        const e = this.elements;
        e[0] *= scale.x; e[1] *= scale.x; e[2] *= scale.x;
        e[4] *= scale.y; e[5] *= scale.y; e[6] *= scale.y;
        e[8] *= scale.z; e[9] *= scale.z; e[10] *= scale.z;
        e[12] = position.x; e[13] = position.y; e[14] = position.z;
        return this;
    }

    /** Inverse of {@link Mat4.compose}: split an affine T · R · S matrix into its parts. */
    decompose(position: Vec3, rotation: Quat, scale: Vec3): this {
        const e = this.elements;
        let sx = Math.hypot(e[0], e[1], e[2]);
        const sy = Math.hypot(e[4], e[5], e[6]);
        const sz = Math.hypot(e[8], e[9], e[10]);
        if (this.determinant() < 0) sx = -sx;

        position.set(e[12], e[13], e[14]);
        scale.set(sx, sy, sz);

        const r = this.clone();
        const re = r.elements;
        const ix = sx ? 1 / sx : 0, iy = sy ? 1 / sy : 0, iz = sz ? 1 / sz : 0;
        re[0] *= ix; re[1] *= ix; re[2] *= ix;
        re[4] *= iy; re[5] *= iy; re[6] *= iy;
        re[8] *= iz; re[9] *= iz; re[10] *= iz;
        rotation.setFromRotationMatrix(r);
        return this;
    }

    /**
     * View matrix (world → camera) for a camera at `eye` looking at `target`.
     * The camera looks down its local −Z axis with `up` as approximate +Y.
     */
    makeLookAt(eye: Vec3, target: Vec3, up: Vec3): this {
        const { x, y, z } = lookAtBasis(eye, target, up);
        return this.set(
            x.x, x.y, x.z, -x.dot(eye),
            y.x, y.y, y.z, -y.dot(eye),
            z.x, z.y, z.z, -z.dot(eye),
            0, 0, 0, 1,
        );
    }

    /** Rotation that turns an object at `eye` so its −Z axis points at `target`. */
    makeLookRotation(eye: Vec3, target: Vec3, up: Vec3): this {
        const { x, y, z } = lookAtBasis(eye, target, up);
        return this.makeBasis(x, y, z);
    }

    /**
     * OpenGL-style perspective projection.
     * @param fovY vertical field of view in radians
     * @param aspect width / height
     */
    makePerspective(fovY: number, aspect: number, near: number, far: number): this {
        const f = 1 / Math.tan(fovY / 2);
        const nf = 1 / (near - far);
        return this.set(
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, 2 * far * near * nf,
            0, 0, -1, 0,
        );
    }

    /** OpenGL-style orthographic projection of the box [left, right] × [bottom, top] × [−near, −far]. */
    makeOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number): this {
        const w = 1 / (right - left);
        const h = 1 / (top - bottom);
        const d = 1 / (far - near);
        return this.set(
            2 * w, 0, 0, -(right + left) * w,
            0, 2 * h, 0, -(top + bottom) * h,
            0, 0, -2 * d, -(far + near) * d,
            0, 0, 0, 1,
        );
    }

    determinant(): number {
        const a = this.elements;
        const b00 = a[0] * a[5] - a[1] * a[4];
        const b01 = a[0] * a[6] - a[2] * a[4];
        const b02 = a[0] * a[7] - a[3] * a[4];
        const b03 = a[1] * a[6] - a[2] * a[5];
        const b04 = a[1] * a[7] - a[3] * a[5];
        const b05 = a[2] * a[7] - a[3] * a[6];
        const b06 = a[8] * a[13] - a[9] * a[12];
        const b07 = a[8] * a[14] - a[10] * a[12];
        const b08 = a[8] * a[15] - a[11] * a[12];
        const b09 = a[9] * a[14] - a[10] * a[13];
        const b10 = a[9] * a[15] - a[11] * a[13];
        const b11 = a[10] * a[15] - a[11] * a[14];
        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    }

    /** Invert in place. A singular matrix becomes the zero matrix. */
    invert(): this {
        const a = this.elements;
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (det === 0) {
            a.fill(0);
            return this;
        }
        const inv = 1 / det;

        a[0] = (a11 * b11 - a12 * b10 + a13 * b09) * inv;
        a[1] = (a02 * b10 - a01 * b11 - a03 * b09) * inv;
        a[2] = (a31 * b05 - a32 * b04 + a33 * b03) * inv;
        a[3] = (a22 * b04 - a21 * b05 - a23 * b03) * inv;
        a[4] = (a12 * b08 - a10 * b11 - a13 * b07) * inv;
        a[5] = (a00 * b11 - a02 * b08 + a03 * b07) * inv;
        a[6] = (a32 * b02 - a30 * b05 - a33 * b01) * inv;
        a[7] = (a20 * b05 - a22 * b02 + a23 * b01) * inv;
        a[8] = (a10 * b10 - a11 * b08 + a13 * b06) * inv;
        a[9] = (a01 * b08 - a00 * b10 - a03 * b06) * inv;
        a[10] = (a30 * b04 - a31 * b02 + a33 * b00) * inv;
        a[11] = (a21 * b02 - a20 * b04 - a23 * b00) * inv;
        a[12] = (a11 * b07 - a10 * b09 - a12 * b06) * inv;
        a[13] = (a00 * b09 - a01 * b07 + a02 * b06) * inv;
        a[14] = (a31 * b01 - a30 * b03 - a32 * b00) * inv;
        a[15] = (a20 * b03 - a21 * b01 + a22 * b00) * inv;
        return this;
    }

    transpose(): this {
        const e = this.elements;
        let t: number;
        t = e[1]; e[1] = e[4]; e[4] = t;
        t = e[2]; e[2] = e[8]; e[8] = t;
        t = e[3]; e[3] = e[12]; e[12] = t;
        t = e[6]; e[6] = e[9]; e[9] = t;
        t = e[7]; e[7] = e[13]; e[13] = t;
        t = e[11]; e[11] = e[14]; e[14] = t;
        return this;
    }

    equals(m: Mat4, epsilon = EPSILON): boolean {
        return this.elements.every((v, i) => Math.abs(v - m.elements[i]) <= epsilon);
    }
}

/** Orthonormal camera basis: z points from target to eye, x to the right, y up. */
function lookAtBasis(eye: Vec3, target: Vec3, up: Vec3): { x: Vec3; y: Vec3; z: Vec3 } {
    const z = Vec3.sub(eye, target);
    if (z.lengthSq() === 0) z.set(0, 0, 1);
    z.normalize();

    let x = Vec3.cross(up, z);
    if (x.lengthSq() === 0) {
        // `up` is parallel to the view direction: nudge z to get a valid basis.
        const nudged = z.clone();
        if (Math.abs(up.z) === 1) nudged.x += 1e-4;
        else nudged.z += 1e-4;
        x = Vec3.cross(up, nudged.normalize());
    }
    x.normalize();
    const y = Vec3.cross(z, x);
    return { x, y, z };
}

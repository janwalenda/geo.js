import {
  determinantFromMinors,
  invertMat4,
  lookAtBasis,
  mat4Minors,
  reciprocal,
} from './mat4Helpers';
import type { Quat } from './Quat';
import type { Mat4Row } from './types';
import { EPSILON } from './utils';
import type { Vec3 } from './Vec3';

const IDENTITY: readonly number[] = [
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
];

/**
 * 4×4 matrix, stored column-major in {@link Mat4.elements}
 * (`elements[col * 4 + row]`), acting on column vectors (`v' = M · v`).
 * Methods mutate `this` and return it.
 *
 * Projection matrices follow the OpenGL convention: right-handed view space
 * looking down −Z, normalized device coordinates in [−1, 1] on all three axes.
 */
export class Mat4 {
  readonly elements = new Float64Array(IDENTITY);

  /** Set all elements, given in **row-major** order for readability. */
  // eslint-disable-next-line @typescript-eslint/max-params -- one per element
  set(
    n11: number,
    n12: number,
    n13: number,
    n14: number,
    n21: number,
    n22: number,
    n23: number,
    n24: number,
    n31: number,
    n32: number,
    n33: number,
    n34: number,
    n41: number,
    n42: number,
    n43: number,
    n44: number,
  ): this {
    return this.setRows(
      [n11, n12, n13, n14],
      [n21, n22, n23, n24],
      [n31, n32, n33, n34],
      [n41, n42, n43, n44],
    );
  }

  /** Set all elements row by row (each row left to right). */
  setRows(r0: Mat4Row, r1: Mat4Row, r2: Mat4Row, r3: Mat4Row): this {
    const e = this.elements;
    [r0, r1, r2, r3].forEach((row, i) => {
      e[i] = row[0];
      e[4 + i] = row[1];
      e[8 + i] = row[2];
      e[12 + i] = row[3];
    });
    return this;
  }

  /** Reset to the identity. Mutates and returns `this`. */
  identity(): this {
    this.elements.set(IDENTITY);
    return this;
  }

  /** Copy all components of `m`. Mutates and returns `this`. */
  copy(m: Mat4): this {
    this.elements.set(m.elements);
    return this;
  }

  /** A new, independent copy. */
  clone(): Mat4 {
    return new Mat4().copy(this);
  }

  /** this = a · b (b is applied first). Safe if `a` or `b` is `this`. */
  multiplyMatrices(a: Mat4, b: Mat4): this {
    const ae = a.elements;
    const be = b.elements;
    const out = new Float64Array(16);
    for (let i = 0; i < 16; i++) {
      const col = i >> 2;
      const row = i & 3;
      out[i] =
        ae[row] * be[col * 4] +
        ae[4 + row] * be[col * 4 + 1] +
        ae[8 + row] * be[col * 4 + 2] +
        ae[12 + row] * be[col * 4 + 3];
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

  /** Translation by `(x, y, z)`. Mutates and returns `this`. */
  makeTranslation(x: number, y: number, z: number): this {
    return this.setRows([1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]);
  }

  /** Scaling by `(x, y, z)` along the axes. Mutates and returns `this`. */
  makeScale(x: number, y: number, z: number): this {
    return this.setRows([x, 0, 0, 0], [0, y, 0, 0], [0, 0, z, 0], [0, 0, 0, 1]);
  }

  /**
   * Rotation of `angle` radians around the X axis (counter-clockwise looking
   * down −X).
   */
  makeRotationX(angle: number): this {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return this.setRows(
      [1, 0, 0, 0],
      [0, c, -s, 0],
      [0, s, c, 0],
      [0, 0, 0, 1],
    );
  }

  /** Rotation of `angle` radians around the Y axis. */
  makeRotationY(angle: number): this {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return this.setRows(
      [c, 0, s, 0],
      [0, 1, 0, 0],
      [-s, 0, c, 0],
      [0, 0, 0, 1],
    );
  }

  /** Rotation of `angle` radians around the Z axis. */
  makeRotationZ(angle: number): this {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return this.setRows(
      [c, -s, 0, 0],
      [s, c, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    );
  }

  /**
   * Rotation of `angle` radians around an arbitrary axis (Rodrigues; the axis
   * is normalized).
   */
  makeRotationAxis(axis: Vec3, angle: number): this {
    const len = axis.length();
    if (len === 0) {
      return this.identity();
    }
    const x = axis.x / len;
    const y = axis.y / len;
    const z = axis.z / len;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    return this.setRows(
      [t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0],
      [t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0],
      [t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0],
      [0, 0, 0, 1],
    );
  }

  /** Pure rotation from a unit quaternion. */
  makeRotationFromQuat(q: Quat): this {
    const { x, y, z, w } = q;
    const [xx, yy, zz] = [x * x * 2, y * y * 2, z * z * 2];
    const [xy, xz, yz] = [x * y * 2, x * z * 2, y * z * 2];
    const [wx, wy, wz] = [w * x * 2, w * y * 2, w * z * 2];
    return this.setRows(
      [1 - (yy + zz), xy - wz, xz + wy, 0],
      [xy + wz, 1 - (xx + zz), yz - wx, 0],
      [xz - wy, yz + wx, 1 - (xx + yy), 0],
      [0, 0, 0, 1],
    );
  }

  /** Matrix whose columns are the given basis vectors. */
  makeBasis(xAxis: Vec3, yAxis: Vec3, zAxis: Vec3): this {
    return this.setRows(
      [xAxis.x, yAxis.x, zAxis.x, 0],
      [xAxis.y, yAxis.y, zAxis.y, 0],
      [xAxis.z, yAxis.z, zAxis.z, 0],
      [0, 0, 0, 1],
    );
  }

  /** T · R · S from position, rotation and scale. */
  compose(position: Vec3, rotation: Quat, scale: Vec3): this {
    this.makeRotationFromQuat(rotation);
    this.scaleColumns(scale.x, scale.y, scale.z);
    this.elements.set([position.x, position.y, position.z], 12);
    return this;
  }

  /**
   * Inverse of {@link Mat4.compose}: split an affine T · R · S matrix into
   * its parts. `this` is not modified; the outputs are.
   */
  decompose(position: Vec3, rotation: Quat, scale: Vec3): this {
    const e = this.elements;
    const flip = this.determinant() < 0 ? -1 : 1;
    const sx = Math.hypot(e[0], e[1], e[2]) * flip;
    const sy = Math.hypot(e[4], e[5], e[6]);
    const sz = Math.hypot(e[8], e[9], e[10]);
    position.set(e[12], e[13], e[14]);
    scale.set(sx, sy, sz);
    const r = this.clone().scaleColumns(
      reciprocal(sx),
      reciprocal(sy),
      reciprocal(sz),
    );
    rotation.setFromRotationMatrix(r);
    return this;
  }

  /**
   * View matrix (world → camera) for a camera at `eye` looking at `target`.
   * The camera looks down its local −Z axis with `up` as approximate +Y.
   */
  makeLookAt(eye: Vec3, target: Vec3, up: Vec3): this {
    const { x, y, z } = lookAtBasis(eye, target, up);
    return this.setRows(
      [x.x, x.y, x.z, -x.dot(eye)],
      [y.x, y.y, y.z, -y.dot(eye)],
      [z.x, z.y, z.z, -z.dot(eye)],
      [0, 0, 0, 1],
    );
  }

  /**
   * Rotation that turns an object at `eye` so its −Z axis points at `target`.
   */
  makeLookRotation(eye: Vec3, target: Vec3, up: Vec3): this {
    const { x, y, z } = lookAtBasis(eye, target, up);
    return this.makeBasis(x, y, z);
  }

  /**
   * OpenGL-style perspective projection.
   * @param fovY vertical field of view in radians
   * @param aspect width / height
   * @param near distance of the near plane (> 0)
   * @param far distance of the far plane (> near)
   */
  makePerspective(
    fovY: number,
    aspect: number,
    near: number,
    far: number,
  ): this {
    const f = 1 / Math.tan(fovY / 2);
    const nf = 1 / (near - far);
    return this.setRows(
      [f / aspect, 0, 0, 0],
      [0, f, 0, 0],
      [0, 0, (far + near) * nf, 2 * far * near * nf],
      [0, 0, -1, 0],
    );
  }

  /**
   * OpenGL-style orthographic projection of the box
   * [left, right] × [bottom, top] × [−near, −far].
   */
  // eslint-disable-next-line @typescript-eslint/max-params -- standard API
  makeOrthographic(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
  ): this {
    const w = 1 / (right - left);
    const h = 1 / (top - bottom);
    const d = 1 / (far - near);
    return this.setRows(
      [2 * w, 0, 0, -(right + left) * w],
      [0, 2 * h, 0, -(top + bottom) * h],
      [0, 0, -2 * d, -(far + near) * d],
      [0, 0, 0, 1],
    );
  }

  /** Determinant of the matrix. */
  determinant(): number {
    return determinantFromMinors(mat4Minors(this.elements));
  }

  /** Invert in place. A singular matrix becomes the zero matrix. */
  invert(): this {
    invertMat4(this.elements);
    return this;
  }

  /** Transpose in place. Mutates and returns `this`. */
  transpose(): this {
    const e = this.elements;
    for (let col = 1; col < 4; col++) {
      for (let row = 0; row < col; row++) {
        const t = e[col * 4 + row];
        e[col * 4 + row] = e[row * 4 + col];
        e[row * 4 + col] = t;
      }
    }
    return this;
  }

  /** Component-wise comparison with a tolerance of `epsilon`. */
  equals(m: Mat4, epsilon = EPSILON): boolean {
    return this.elements.every(
      (v, i) => Math.abs(v - m.elements[i]) <= epsilon,
    );
  }

  /** Multiply the first three columns by `x`, `y` and `z`. */
  private scaleColumns(x: number, y: number, z: number): this {
    const e = this.elements;
    [x, y, z].forEach((factor, col) => {
      for (let row = 0; row < 3; row++) {
        e[col * 4 + row] *= factor;
      }
    });
    return this;
  }
}

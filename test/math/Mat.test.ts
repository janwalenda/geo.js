import { describe, expect, it } from 'vitest';

import { degToRad, Mat3, Mat4, Quat, Vec3 } from '../../src/math/index';
import { expectArray, expectVec } from '../helpers';

const identity4 = new Mat4();

function randomAffine(): Mat4 {
  return new Mat4().compose(
    new Vec3(3, -2, 7),
    new Quat().setFromEuler(0.3, -1.2, 2.1),
    new Vec3(2, 0.5, 1.5),
  );
}

describe('Mat4', () => {
  it('stores elements column-major but sets them row-major', () => {
    const m = new Mat4().set(
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
    );
    expectArray(
      m.elements,
      [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16],
    );
  });

  it('multiply applies the right-hand matrix first', () => {
    const t = new Mat4().makeTranslation(10, 0, 0);
    const r = new Mat4().makeRotationZ(Math.PI / 2);
    // T · R: rotate first, then translate.
    expectVec(new Vec3(1, 0, 0).applyMat4(t.clone().multiply(r)), {
      x: 10,
      y: 1,
      z: 0,
    });
    // R · T: translate first, then rotate.
    expectVec(new Vec3(1, 0, 0).applyMat4(t.clone().premultiply(r)), {
      x: 0,
      y: 11,
      z: 0,
    });
  });

  it('basic rotations are counter-clockwise (right-handed)', () => {
    expectVec(
      new Vec3(0, 1, 0).applyMat4(new Mat4().makeRotationX(Math.PI / 2)),
      { x: 0, y: 0, z: 1 },
    );
    expectVec(
      new Vec3(0, 0, 1).applyMat4(new Mat4().makeRotationY(Math.PI / 2)),
      { x: 1, y: 0, z: 0 },
    );
    expectVec(
      new Vec3(1, 0, 0).applyMat4(new Mat4().makeRotationZ(Math.PI / 2)),
      { x: 0, y: 1, z: 0 },
    );
  });

  it('makeRotationAxis matches the basic rotations and normalizes the axis', () => {
    const a = new Mat4().makeRotationAxis(new Vec3(0, 5, 0), 0.7);
    expect(a.equals(new Mat4().makeRotationY(0.7))).toBe(true);
  });

  it('makeRotationAxis is correct for arbitrary axes (regression: old Matrix3 diagonal)', () => {
    const axis = new Vec3(1, 1, 1).normalize();
    const m = new Mat4().makeRotationAxis(axis, (2 * Math.PI) / 3);
    // 120° around (1,1,1) cycles the coordinate axes.
    expectVec(new Vec3(1, 0, 0).applyMat4(m), { x: 0, y: 1, z: 0 });
    expectVec(axis.clone().applyMat4(m), axis);
    expect(m.determinant()).toBeCloseTo(1);
  });

  it('invert yields M · M⁻¹ = I', () => {
    const m = randomAffine();
    expect(m.clone().multiply(m.clone().invert()).equals(identity4)).toBe(true);
    const p = new Mat4().makePerspective(1, 1.5, 0.1, 50);
    expect(p.clone().multiply(p.clone().invert()).equals(identity4)).toBe(true);
  });

  it('invert of a singular matrix is the zero matrix', () => {
    const m = new Mat4().makeScale(1, 0, 1).invert();
    expect(m.elements.every((v) => v === 0)).toBe(true);
  });

  it('determinant equals the product of scales', () => {
    expect(randomAffine().determinant()).toBeCloseTo(2 * 0.5 * 1.5);
  });

  it('transpose twice is the identity operation', () => {
    const m = randomAffine();
    expect(m.clone().transpose().transpose().equals(m)).toBe(true);
  });

  it('compose and decompose round-trip', () => {
    const position = new Vec3(1, 2, 3);
    const rotation = new Quat().setFromEuler(0.4, 0.5, -0.6);
    const scale = new Vec3(2, 3, 4);
    const m = new Mat4().compose(position, rotation, scale);

    const p = new Vec3(),
      q = new Quat(),
      s = new Vec3();
    m.decompose(p, q, s);
    expectVec(p, position);
    expectVec(s, scale);
    expect(q.equals(rotation)).toBe(true);
  });

  it('makeLookAt moves the target onto the −Z axis', () => {
    const eye = new Vec3(4, 5, 6);
    const target = new Vec3(-1, 0, 2);
    const view = new Mat4().makeLookAt(eye, target, new Vec3(0, 1, 0));
    const t = target.clone().applyMat4(view);
    expect(t.x).toBeCloseTo(0);
    expect(t.y).toBeCloseTo(0);
    expect(t.z).toBeCloseTo(-eye.distanceTo(target));
  });

  it('makeLookAt survives an up vector parallel to the view direction', () => {
    const view = new Mat4().makeLookAt(
      new Vec3(0, 10, 0),
      new Vec3(),
      new Vec3(0, 1, 0),
    );
    expect(view.elements.every(Number.isFinite)).toBe(true);
    expect(view.determinant()).toBeCloseTo(1);
  });

  it('makeLookRotation is the inverse rotation of makeLookAt', () => {
    const eye = new Vec3(1, 2, 3);
    const target = new Vec3(0, 0, 0);
    const up = new Vec3(0, 1, 0);
    const world = new Mat4().makeLookRotation(eye, target, up);
    world.elements[12] = eye.x;
    world.elements[13] = eye.y;
    world.elements[14] = eye.z;
    expect(world.invert().equals(new Mat4().makeLookAt(eye, target, up))).toBe(
      true,
    );
  });

  it('perspective maps near/far to NDC z = −1/+1 and the fov edge to y = 1', () => {
    const near = 0.5,
      far = 20,
      fov = degToRad(60);
    const p = new Mat4().makePerspective(fov, 2, near, far);
    expect(new Vec3(0, 0, -near).applyMat4(p).z).toBeCloseTo(-1);
    expect(new Vec3(0, 0, -far).applyMat4(p).z).toBeCloseTo(1);
    const edge = new Vec3(0, Math.tan(fov / 2) * 5, -5).applyMat4(p);
    expect(edge.y).toBeCloseTo(1);
    const side = new Vec3(Math.tan(fov / 2) * 5 * 2, 0, -5).applyMat4(p);
    expect(side.x).toBeCloseTo(1);
  });

  it('orthographic maps the box onto the NDC cube', () => {
    const o = new Mat4().makeOrthographic(-4, 4, 3, -3, 1, 11);
    expectVec(new Vec3(-4, -3, -1).applyMat4(o), { x: -1, y: -1, z: -1 });
    expectVec(new Vec3(4, 3, -11).applyMat4(o), { x: 1, y: 1, z: 1 });
  });
});

describe('Mat3', () => {
  it('invert yields M · M⁻¹ = I', () => {
    const m = new Mat3().set(2, 1, 0, 0, 3, 1, 1, 0, 4);
    expect(m.clone().multiply(m.clone().invert()).equals(new Mat3())).toBe(
      true,
    );
    expect(m.determinant()).toBeCloseTo(25);
  });

  it('normal matrix keeps normals perpendicular under non-uniform scale', () => {
    const model = new Mat4()
      .makeScale(4, 1, 1)
      .multiply(new Mat4().makeRotationZ(Math.PI / 4));
    const tangent = new Vec3(1, -1, 0).applyMat4(model);
    const normal = new Vec3(1, 1, 0).applyMat3(
      new Mat3().setNormalMatrix(model),
    );
    expect(tangent.dot(normal)).toBeCloseTo(0);
  });
});

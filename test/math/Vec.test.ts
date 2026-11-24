import { describe, expect, it } from 'vitest';

import { Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from '../../src/math/index';
import { expectVec } from '../helpers';

describe('Vec2', () => {
  it('does basic arithmetic and chains', () => {
    expectVec(new Vec2(1, 2).add(new Vec2(3, 4)).scale(2), { x: 8, y: 12 });
    expect(new Vec2(3, 4).length()).toBe(5);
    expect(new Vec2(1, 0).cross(new Vec2(0, 1))).toBe(1);
    expect(new Vec2(0, 0).normalize().length()).toBe(0);
  });

  it('rotates counter-clockwise around a center', () => {
    expectVec(new Vec2(1, 0).rotate(Math.PI / 2), { x: 0, y: 1 });
    expectVec(new Vec2(2, 1).rotate(Math.PI, new Vec2(1, 1)), { x: 0, y: 1 });
  });

  it('applies 2D affine matrices', () => {
    const m = new Mat3()
      .makeTranslation(5, 0)
      .multiply(new Mat3().makeRotation(Math.PI / 2));
    expectVec(new Vec2(1, 0).applyMat3(m), { x: 5, y: 1 });
  });
});

describe('Vec3', () => {
  it('computes dot and right-handed cross products', () => {
    const x = new Vec3(1, 0, 0);
    const y = new Vec3(0, 1, 0);
    expect(x.dot(y)).toBe(0);
    expectVec(Vec3.cross(x, y), { x: 0, y: 0, z: 1 });
    expectVec(Vec3.cross(y, x), { x: 0, y: 0, z: -1 });
  });

  it('static helpers do not mutate their inputs', () => {
    const a = new Vec3(1, 2, 3);
    const b = new Vec3(4, 5, 6);
    Vec3.add(a, b);
    Vec3.sub(a, b);
    Vec3.cross(a, b);
    expectVec(a, { x: 1, y: 2, z: 3 });
    expectVec(b, { x: 4, y: 5, z: 6 });
  });

  it('normalizes and measures', () => {
    expect(new Vec3(2, 3, 6).length()).toBe(7);
    expect(new Vec3(2, 3, 6).normalize().length()).toBeCloseTo(1);
    expect(new Vec3(1, 1, 1).distanceTo(new Vec3(1, 4, 5))).toBe(5);
    expectVec(new Vec3(0, 0, 0).lerp(new Vec3(10, 20, 30), 0.5), {
      x: 5,
      y: 10,
      z: 15,
    });
  });

  it('applies Mat4 as a point (with translation) and as a direction (without)', () => {
    const m = new Mat4().makeTranslation(1, 2, 3);
    expectVec(new Vec3(1, 1, 1).applyMat4(m), { x: 2, y: 3, z: 4 });
    expectVec(new Vec3(0, 0, 2).transformDirection(m), { x: 0, y: 0, z: 1 });
  });

  it('rotation by quaternion and by matrix agree', () => {
    const axis = new Vec3(1, 2, 3);
    const q = new Quat().setFromAxisAngle(axis, 1.234);
    const m = new Mat4().makeRotationAxis(axis, 1.234);
    const v = new Vec3(-2, 0.5, 4);
    expect(v.clone().applyQuat(q).equals(v.clone().applyMat4(m))).toBe(true);
    expect(v.clone().applyQuat(q).length()).toBeCloseTo(v.length());
  });
});

describe('Vec4', () => {
  it('keeps w through the projection (no divide)', () => {
    const p = new Mat4().makePerspective(Math.PI / 2, 1, 1, 100);
    const clip = new Vec4().setFromVec3(new Vec3(0, 0, -10)).applyMat4(p);
    expect(clip.w).toBeCloseTo(10);
  });
});

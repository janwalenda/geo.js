import { describe, expect, it } from 'vitest';
import { expectVec } from '../helpers';
import { Mat4, Quat, Vec3, approxEqual, clamp, degToRad, lerp, radToDeg } from '../../src/math/index';

describe('Quat', () => {
    it('axis-angle rotates counter-clockwise', () => {
        const q = new Quat().setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 2);
        expectVec(new Vec3(1, 0, 0).applyQuat(q), { x: 0, y: 1, z: 0 });
    });

    it('setFromEuler XYZ equals Rx · Ry · Rz', () => {
        const q = new Quat().setFromEuler(0.3, 0.6, 0.9, 'XYZ');
        const m = new Mat4().makeRotationX(0.3)
            .multiply(new Mat4().makeRotationY(0.6))
            .multiply(new Mat4().makeRotationZ(0.9));
        expect(new Mat4().makeRotationFromQuat(q).equals(m)).toBe(true);
    });

    it('setFromEuler ZYX equals Rz · Ry · Rx', () => {
        const q = new Quat().setFromEuler(0.3, 0.6, 0.9, 'ZYX');
        const m = new Mat4().makeRotationZ(0.9)
            .multiply(new Mat4().makeRotationY(0.6))
            .multiply(new Mat4().makeRotationX(0.3));
        expect(new Mat4().makeRotationFromQuat(q).equals(m)).toBe(true);
    });

    it('round-trips through rotation matrices for every branch of the extraction', () => {
        const cases = [
            new Quat().setFromAxisAngle(new Vec3(0.2, 0.3, 0.1), 0.5), // trace > 0
            new Quat().setFromAxisAngle(new Vec3(1, 0.1, 0), 3), // m11 dominant
            new Quat().setFromAxisAngle(new Vec3(0, 1, 0.1), 3), // m22 dominant
            new Quat().setFromAxisAngle(new Vec3(0.1, 0, 1), 3), // m33 dominant
        ];
        for (const q of cases) {
            const back = new Quat().setFromRotationMatrix(new Mat4().makeRotationFromQuat(q));
            expect(back.equals(q)).toBe(true);
        }
    });

    it('multiply applies the right-hand rotation first', () => {
        const a = new Quat().setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 2);
        const b = new Quat().setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);
        const v = new Vec3(0, 1, 0);
        const viaProduct = v.clone().applyQuat(a.clone().multiply(b));
        const stepwise = v.clone().applyQuat(b).applyQuat(a);
        expectVec(viaProduct, stepwise);
    });

    it('invert undoes the rotation', () => {
        const q = new Quat().setFromEuler(1, 2, 3);
        const v = new Vec3(1, 2, 3);
        expectVec(v.clone().applyQuat(q).applyQuat(q.clone().invert()), v);
    });

    it('slerp interpolates the angle linearly', () => {
        const a = new Quat();
        const b = new Quat().setFromAxisAngle(new Vec3(0, 1, 0), 2);
        const half = a.clone().slerp(b, 0.5);
        expect(half.angleTo(a)).toBeCloseTo(1);
        expect(half.equals(new Quat().setFromAxisAngle(new Vec3(0, 1, 0), 1))).toBe(true);
        expect(a.clone().slerp(a, 0.3).equals(a)).toBe(true);
    });

    it('treats q and −q as the same rotation', () => {
        const q = new Quat().setFromEuler(0.1, 0.2, 0.3);
        expect(q.equals(new Quat(-q.x, -q.y, -q.z, -q.w))).toBe(true);
    });
});

describe('utils', () => {
    it('converts angles and clamps', () => {
        expect(degToRad(180)).toBeCloseTo(Math.PI);
        expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
        expect(clamp(5, 0, 1)).toBe(1);
        expect(lerp(2, 4, 0.25)).toBe(2.5);
        expect(approxEqual(0.1 + 0.2, 0.3)).toBe(true);
    });
});

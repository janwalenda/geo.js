import { describe, expect, it } from 'vitest';
import { Vec3 } from '../../src/math';
import { type DepthItem, depthOrder } from '../../src/render/depthOrder';

/** Camera-facing square in view space (camera at origin, looking down −Z), projected 1:1 to the screen. */
function quad(x: number, y: number, z: number, size: number, depth = -z): DepthItem {
    const polygon = [
        new Vec3(x, y, z), new Vec3(x + size, y, z), new Vec3(x + size, y + size, z), new Vec3(x, y + size, z),
    ];
    return { depth, polygon, screen: polygon.flatMap((p) => [p.x, p.y]) };
}

describe('depthOrder', () => {
    it('falls back to depth order (stable) without occlusion constraints', () => {
        const items: DepthItem[] = [
            { depth: 2, polygon: null, screen: null },
            { depth: 5, polygon: null, screen: null },
            { depth: 2, polygon: null, screen: null },
        ];
        expect(depthOrder(items)).toEqual([1, 0, 2]);
        expect(depthOrder([])).toEqual([]);
    });

    it('overrides a misleading depth when the planes separate overlapping faces', () => {
        // The far face claims to be nearer (as a huge floor tile's center would).
        const far = quad(0, 0, -10, 4, 1);
        const near = quad(1, 1, -5, 1, 3);
        expect(depthOrder([near, far])).toEqual([1, 0]);
    });

    it('ignores faces that only touch on screen', () => {
        const a = quad(0, 0, -5, 1, 1);
        const b = quad(1, 0, -9, 1, 9);
        expect(depthOrder([a, b])).toEqual([1, 0]);
    });

    it('breaks cycles by depth instead of dropping items', () => {
        // Three mutually overlapping strips, each tilted so it lies over the next (cyclic overlap).
        const strip = (angle: number, depth: number): DepthItem => {
            const c = Math.cos(angle), s = Math.sin(angle);
            const at = (u: number, v: number, z: number): Vec3 => new Vec3(u * c - v * s, u * s + v * c, z);
            const polygon = [at(-3, -0.5, -9), at(3, -0.5, -11), at(3, 0.5, -11), at(-3, 0.5, -9)];
            return { depth, polygon, screen: polygon.flatMap((p) => [p.x, p.y]) };
        };
        const items = [strip(0, 10), strip((2 * Math.PI) / 3, 10.1), strip((4 * Math.PI) / 3, 10.2)];
        const order = depthOrder(items);
        expect([...order].sort()).toEqual([0, 1, 2]);
    });
});

import { describe, expect, it } from 'vitest';
import { Vec3 } from '../../src/math';
import {
    BoxGeometry, ConeGeometry, CylinderGeometry, Geometry, IcosahedronGeometry, OctahedronGeometry,
    ParametricGeometry, PlaneGeometry, TetrahedronGeometry, TorusGeometry, UVSphereGeometry,
} from '../../src/geometry/index';

/** Every face normal points away from `insidePoint(faceCenter)`. */
function expectOutward(g: Geometry, insidePoint: (center: Vec3) => Vec3 = () => new Vec3()): void {
    for (let i = 0; i < g.faces.length; i++) {
        const center = g.faceCenter(i);
        const outward = center.clone().sub(insidePoint(center));
        expect(g.faceNormal(i).dot(outward), `face ${i}`).toBeGreaterThan(0);
    }
}

/** Closed and consistently oriented: each directed edge occurs once, its reverse exactly once. */
function expectWatertight(g: Geometry): void {
    const directed = new Map<string, number>();
    for (const face of g.faces) {
        for (let i = 0; i < face.length; i++) {
            const key = `${face[i]}>${face[(i + 1) % face.length]}`;
            directed.set(key, (directed.get(key) ?? 0) + 1);
        }
    }
    for (const [key, count] of directed) {
        const [a, b] = key.split('>');
        expect(count, `edge ${key} used twice in the same direction`).toBe(1);
        expect(directed.get(`${b}>${a}`), `edge ${key} has no opposite`).toBe(1);
    }
}

function expectOnSphere(g: Geometry, radius: number): void {
    for (const v of g.vertices) expect(v.length()).toBeCloseTo(radius);
}

describe('geometry generators', () => {
    it('BoxGeometry: 8 vertices, 6 outward quads, watertight, correct size', () => {
        const g = new BoxGeometry(2, 4, 6);
        expect(g.vertices).toHaveLength(8);
        expect(g.faces.every((f) => f.length === 4)).toBe(true);
        expectOutward(g);
        expectWatertight(g);
        expect(Math.max(...g.vertices.map((v) => v.z))).toBe(3);
    });

    it('PlaneGeometry: grid facing +Z', () => {
        const g = new PlaneGeometry(2, 1, 4, 3);
        expect(g.vertices).toHaveLength(5 * 4);
        expect(g.faces).toHaveLength(12);
        for (let i = 0; i < g.faces.length; i++) expect(g.faceNormal(i).z).toBeCloseTo(1);
    });

    it('UVSphereGeometry: poles are shared, outward and watertight', () => {
        const g = new UVSphereGeometry(2, 12, 6);
        expect(g.vertices).toHaveLength(2 + 12 * 5);
        expect(g.faces).toHaveLength(12 * 6);
        expectOnSphere(g, 2);
        expectOutward(g);
        expectWatertight(g);
    });

    it.each([
        ['Tetrahedron', () => new TetrahedronGeometry(1.5), 4, 4],
        ['Octahedron', () => new OctahedronGeometry(1.5), 6, 8],
        ['Icosahedron', () => new IcosahedronGeometry(1.5), 12, 20],
    ])('%s has the right counts and is outward and watertight', (_, make, nv, nf) => {
        const g = make();
        expect(g.vertices).toHaveLength(nv);
        expect(g.faces).toHaveLength(nf);
        expectOnSphere(g, 1.5);
        expectOutward(g);
        expectWatertight(g);
    });

    it('icosphere subdivision shares midpoints (regression: old subdivide used pos1+pos2 thrice)', () => {
        const g = new IcosahedronGeometry(1, 2);
        // V = 10·4^n + 2, F = 20·4^n
        expect(g.vertices).toHaveLength(162);
        expect(g.faces).toHaveLength(320);
        expectOnSphere(g, 1);
        expectOutward(g);
        expectWatertight(g);
    });

    it('TorusGeometry: normals point away from the tube center, watertight', () => {
        const R = 2;
        const g = new TorusGeometry(R, 0.5, 8, 16);
        expect(g.vertices).toHaveLength(8 * 16);
        expectOutward(g, (c) => new Vec3(c.x, 0, c.z).normalize().scale(R));
        expectWatertight(g);
    });

    it('CylinderGeometry and ConeGeometry are outward and watertight', () => {
        const cylinder = new CylinderGeometry(1, 1, 2, 10);
        expect(cylinder.faces).toHaveLength(12);
        expectOutward(cylinder);
        expectWatertight(cylinder);

        const cone = new ConeGeometry(1, 2, 10);
        expect(cone.vertices).toHaveLength(11);
        expect(cone.faces.slice(0, 10).every((f) => f.length === 3)).toBe(true);
        expectOutward(cone);
        expectWatertight(cone);
    });

    it('ParametricGeometry samples the function and faces along ∂u × ∂v', () => {
        const g = new ParametricGeometry((u, v) => new Vec3(u, v, u * v), { slicesU: 4, slicesV: 2 });
        expect(g.vertices).toHaveLength(5 * 3);
        expect(g.vertices[g.vertices.length - 1].z).toBe(1);
        expect(g.faceNormal(0).z).toBeGreaterThan(0);
    });
});

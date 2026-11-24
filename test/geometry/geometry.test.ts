import { describe, expect, it } from 'vitest';

import type { Geometry } from '../../src/geometry/index';
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  ParametricGeometry,
  PlaneGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  UVSphereGeometry,
} from '../../src/geometry/index';
import { Vec3 } from '../../src/math';

/** Every face normal points away from `insidePoint(faceCenter)`. */
function expectOutward(
  g: Geometry,
  insidePoint: (center: Vec3) => Vec3 = () => new Vec3(),
): void {
  for (let i = 0; i < g.faces.length; i++) {
    const center = g.faceCenter(i);
    const outward = center.clone().sub(insidePoint(center));
    expect(g.faceNormal(i).dot(outward), `face ${i}`).toBeGreaterThan(0);
  }
}

/**
 * Closed and consistently oriented: each directed edge occurs once, its reverse
 * exactly once.
 */
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
  for (const v of g.vertices) {
    expect(v.length()).toBeCloseTo(radius);
  }
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
    for (let i = 0; i < g.faces.length; i++) {
      expect(g.faceNormal(i).z).toBeCloseTo(1);
    }
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
    ['Tetrahedron', (): Geometry => new TetrahedronGeometry(1.5), 4, 4],
    ['Octahedron', (): Geometry => new OctahedronGeometry(1.5), 6, 8],
    ['Icosahedron', (): Geometry => new IcosahedronGeometry(1.5), 12, 20],
  ])(
    '%s has the right counts and is outward and watertight',
    (_, make, nv, nf) => {
      const g = make();
      expect(g.vertices).toHaveLength(nv);
      expect(g.faces).toHaveLength(nf);
      expectOnSphere(g, 1.5);
      expectOutward(g);
      expectWatertight(g);
    },
  );

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
    const g = new ParametricGeometry((u, v) => new Vec3(u, v, u * v), {
      slicesU: 4,
      slicesV: 2,
    });
    expect(g.vertices).toHaveLength(5 * 3);
    expect(g.vertices[g.vertices.length - 1].z).toBe(1);
    expect(g.faceNormal(0).z).toBeGreaterThan(0);
  });
});

describe('UV coordinates', () => {
  const withUVs: [string, Geometry][] = [
    ['Plane', new PlaneGeometry(2, 1, 3, 2)],
    ['Box', new BoxGeometry()],
    ['UVSphere', new UVSphereGeometry(1, 8, 4)],
    ['Torus', new TorusGeometry()],
    [
      'Parametric',
      new ParametricGeometry((u, v) => new Vec3(u, v, 0), {
        slicesU: 2,
        slicesV: 2,
      }),
    ],
  ];

  it.each(withUVs)(
    '%s has one UV per face corner, inside the unit square',
    (_, g) => {
      expect(g.uvs).not.toBeNull();
      expect(g.uvs?.length).toBe(g.faces.length);
      g.faces.forEach((face, f) => {
        expect(g.uvs?.[f].length).toBe(face.length);
        for (const uv of g.uvs?.[f] ?? []) {
          expect(uv.x).toBeGreaterThanOrEqual(0);
          expect(uv.x).toBeLessThanOrEqual(1);
          expect(uv.y).toBeGreaterThanOrEqual(0);
          expect(uv.y).toBeLessThanOrEqual(1);
        }
      });
    },
  );

  it('puts the top-left of the image at the top-left of a plane', () => {
    const g = new PlaneGeometry(2, 2);
    const corner = g.faces[0].findIndex(
      (i) => g.vertices[i].x < 0 && g.vertices[i].y > 0,
    );
    expect([g.uvs?.[0][corner].x, g.uvs?.[0][corner].y]).toEqual([0, 0]);
  });

  it('orients textures unmirrored on the front side (image right × image down points into the surface)', () => {
    for (const g of [
      new PlaneGeometry(),
      new ParametricGeometry((u, v) => new Vec3(u, v, 0), {
        slicesU: 1,
        slicesV: 1,
      }),
    ]) {
      const [a, b, , d] = g.faces[0].map((i) => g.vertices[i]);
      const [ua, ub, , ud] = g.uvs?.[0] ?? [];
      // Face 0 is an axis-aligned quad: a→b runs along image u, a→d along image
      // v.
      const right = (ub.x > ua.x ? b : a).clone().sub(ub.x > ua.x ? a : b);
      const down = (ud.y > ua.y ? d : a).clone().sub(ud.y > ua.y ? a : d);
      expect(right.cross(down).dot(g.faceNormal(0))).toBeLessThan(0);
    }
  });

  it('gives the sphere a seam: the last column ends at u = 0, not wrapping back to 1', () => {
    const g = new UVSphereGeometry(1, 4, 2);
    const us = (g.uvs ?? []).flat().map((uv) => uv.x);
    expect(Math.min(...us)).toBe(0);
    expect(Math.max(...us)).toBe(1);
  });

  it('has no UVs on generic geometries and clones copy them deeply', () => {
    expect(new IcosahedronGeometry().uvs).toBeNull();
    const g = new PlaneGeometry();
    const copy = g.clone();
    expect(copy.uvs).toEqual(g.uvs);
    expect(copy.uvs?.[0][0]).not.toBe(g.uvs?.[0][0]);
  });
});

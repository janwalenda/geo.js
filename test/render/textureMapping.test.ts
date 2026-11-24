import { describe, expect, it } from 'vitest';

import {
  affineFromTriangle,
  autoTextureDetail,
  inflatePolygon,
} from '../../src/render/textureMapping';
import { expectArray } from '../helpers';

/** Apply [a, b, c, d, e, f] to (u, v). */
function apply(m: number[], u: number, v: number): [number, number] {
  return [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]];
}

describe('affineFromTriangle', () => {
  it('maps each texture corner exactly onto its screen corner', () => {
    const uv = [0.1, 0.2, 0.9, 0.3, 0.4, 0.8];
    const xy = [10, 50, 120, 40, 60, 140];
    const m = affineFromTriangle(uv, xy);
    expect(m).not.toBeNull();
    for (let i = 0; i < 3; i++) {
      expectArray(apply(m ?? [], uv[i * 2], uv[i * 2 + 1]), [
        xy[i * 2],
        xy[i * 2 + 1],
      ]);
    }
  });

  it('is a pure scale + translation for an axis-aligned unit square', () => {
    const m = affineFromTriangle([0, 0, 1, 0, 0, 1], [5, 7, 105, 7, 5, 57]);
    expectArray(m ?? [], [100, 0, 0, 50, 5, 7]);
  });

  it('rejects degenerate texture triangles', () => {
    expect(
      affineFromTriangle([0, 0, 1, 1, 2, 2], [0, 0, 1, 0, 0, 1]),
    ).toBeNull();
  });
});

describe('inflatePolygon', () => {
  it('pushes every edge outwards by the amount, for both windings', () => {
    const ccw = [0, 0, 10, 0, 10, 10, 0, 10];
    expectArray(inflatePolygon(ccw, 1), [-1, -1, 11, -1, 11, 11, -1, 11]);
    const cw = [0, 0, 0, 10, 10, 10, 10, 0];
    expectArray(inflatePolygon(cw, 1), [-1, -1, -1, 11, 11, 11, 11, -1]);
  });

  it('caps the miter at sharp corners and leaves the input untouched', () => {
    const sliver = [0, 0, 100, 0, 0, 1];
    const out = inflatePolygon(sliver, 0.5);
    expect(sliver).toEqual([0, 0, 100, 0, 0, 1]);
    for (let i = 0; i < 6; i += 2) {
      expect(
        Math.hypot(out[i] - sliver[i], out[i + 1] - sliver[i + 1]),
      ).toBeLessThanOrEqual(2 + 1e-9);
    }
  });

  it('is a no-op for amount 0 and degenerate polygons', () => {
    const tri = [0, 0, 1, 0, 0, 1];
    expect(inflatePolygon(tri, 0)).toBe(tri);
    const flat = [0, 0, 1, 1, 2, 2];
    expect(inflatePolygon(flat, 1)).toBe(flat);
  });
});

describe('autoTextureDetail', () => {
  it('uses one piece for triangles at constant depth and more for steep ones, capped at 8', () => {
    expect(autoTextureDetail(5, 5)).toBe(1);
    expect(autoTextureDetail(5, 6)).toBeGreaterThan(1);
    expect(autoTextureDetail(1, 100)).toBe(8);
    expect(autoTextureDetail(0, 1)).toBe(8);
  });
});

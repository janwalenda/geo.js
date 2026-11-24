import { Vec2 } from '../math/Vec2';
import { Vec3 } from '../math/Vec3';
import type { GridSize, QuadGrid } from './types';

/**
 * Faces and UVs for a grid of vertices stored row by row (`rows × columns`,
 * row `j` holds the samples at `v = j / cellsV`). A grid with as many columns
 * (rows) as cells wraps around: its last cells reuse the first column (row).
 * UVs: texture point `(u, 1 − v)`, so the image reads unmirrored.
 */
export function quadGrid(size: GridSize): QuadGrid {
  const { cellsU, cellsV, columns, rows } = size;
  const index = (i: number, j: number): number =>
    (j % rows) * columns + (i % columns);
  const uv = (i: number, j: number): Vec2 =>
    new Vec2(i / cellsU, 1 - j / cellsV);
  const grid: QuadGrid = { faces: [], uvs: [] };
  for (let j = 0; j < cellsV; j++) {
    for (let i = 0; i < cellsU; i++) {
      const corners: [number, number][] = [
        [i, j],
        [i + 1, j],
        [i + 1, j + 1],
        [i, j + 1],
      ];
      grid.faces.push(corners.map(([u, v]) => index(u, v)));
      grid.uvs.push(corners.map(([u, v]) => uv(u, v)));
    }
  }
  return grid;
}

/**
 * Vertices of a UV sphere: the north pole, rings `1 … h − 1` with `w`
 * vertices each (longitude growing counter-clockwise seen from above), and
 * the south pole last.
 */
export function sphereVertices(radius: number, w: number, h: number): Vec3[] {
  const vertices: Vec3[] = [new Vec3(0, radius, 0)];
  for (let iy = 1; iy < h; iy++) {
    const theta = (iy / h) * Math.PI;
    const y = radius * Math.cos(theta);
    const r = radius * Math.sin(theta);
    for (let ix = 0; ix < w; ix++) {
      const phi = (ix / w) * Math.PI * 2;
      vertices.push(new Vec3(r * Math.cos(phi), y, r * Math.sin(phi)));
    }
  }
  vertices.push(new Vec3(0, -radius, 0));
  return vertices;
}

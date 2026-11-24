import { Vec2 } from '../math/Vec2';
import { Geometry } from './Geometry';
import { sphereVertices } from './helpers';

/**
 * Sphere from latitude/longitude rings (like a globe): quads in the bands and
 * triangles at the poles, which are single shared vertices. UVs are an
 * equirectangular projection (a world map wraps around it, north at the top).
 */
export class UVSphereGeometry extends Geometry {
  constructor(radius = 1, widthSegments = 24, heightSegments = 12) {
    const w = Math.max(3, Math.floor(widthSegments));
    const h = Math.max(2, Math.floor(heightSegments));
    const vertices = sphereVertices(radius, w, h);
    const south = vertices.length - 1;
    const faces: number[][] = [];
    const uvs: Vec2[][] = [];
    const ring = (iy: number, ix: number): number =>
      1 + (iy - 1) * w + (ix % w);
    // Longitude grows counter-clockwise seen from above, i.e. right to left
    // seen from outside.
    const uv = (iy: number, ix: number): Vec2 => new Vec2(1 - ix / w, iy / h);

    for (let ix = 0; ix < w; ix++) {
      faces.push([0, ring(1, ix + 1), ring(1, ix)]);
      uvs.push([uv(0, ix + 0.5), uv(1, ix + 1), uv(1, ix)]);
    }
    for (let iy = 1; iy < h - 1; iy++) {
      for (let ix = 0; ix < w; ix++) {
        const corners: [number, number][] = [
          [iy, ix + 1],
          [iy + 1, ix + 1],
          [iy + 1, ix],
          [iy, ix],
        ];
        faces.push(corners.map(([y, x]) => ring(y, x)));
        uvs.push(corners.map(([y, x]) => uv(y, x)));
      }
    }
    for (let ix = 0; ix < w; ix++) {
      faces.push([south, ring(h - 1, ix), ring(h - 1, ix + 1)]);
      uvs.push([uv(h, ix + 0.5), uv(h - 1, ix), uv(h - 1, ix + 1)]);
    }
    super(vertices, faces, uvs);
  }
}

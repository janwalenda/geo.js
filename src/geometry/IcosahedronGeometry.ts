import { Vec3 } from '../math/Vec3';
import { PolyhedronGeometry } from './PolyhedronGeometry';

/**
 * Regular icosahedron (20 triangles); with `detail > 0` an evenly tessellated
 * "ico sphere".
 */
export class IcosahedronGeometry extends PolyhedronGeometry {
  constructor(radius = 1, detail = 0) {
    const t = (1 + Math.sqrt(5)) / 2;
    super(
      [
        new Vec3(-1, t, 0),
        new Vec3(1, t, 0),
        new Vec3(-1, -t, 0),
        new Vec3(1, -t, 0),
        new Vec3(0, -1, t),
        new Vec3(0, 1, t),
        new Vec3(0, -1, -t),
        new Vec3(0, 1, -t),
        new Vec3(t, 0, -1),
        new Vec3(t, 0, 1),
        new Vec3(-t, 0, -1),
        new Vec3(-t, 0, 1),
      ],
      [
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1],
      ],
      radius,
      detail,
    );
  }
}

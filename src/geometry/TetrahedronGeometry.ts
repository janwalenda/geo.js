import { Vec3 } from '../math/Vec3';
import { PolyhedronGeometry } from './PolyhedronGeometry';

/** Regular tetrahedron (4 triangles). */
export class TetrahedronGeometry extends PolyhedronGeometry {
  constructor(radius = 1, detail = 0) {
    super(
      [
        new Vec3(1, 1, 1),
        new Vec3(-1, -1, 1),
        new Vec3(-1, 1, -1),
        new Vec3(1, -1, -1),
      ],
      [
        [2, 1, 0],
        [0, 3, 2],
        [1, 3, 0],
        [2, 3, 1],
      ],
      radius,
      detail,
    );
  }
}

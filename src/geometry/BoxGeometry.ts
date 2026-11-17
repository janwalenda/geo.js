import { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';

/** Axis-aligned box centered at the origin, made of six quads. */
export class BoxGeometry extends Geometry {
    constructor(width = 1, height = 1, depth = 1) {
        const x = width / 2, y = height / 2, z = depth / 2;
        // Vertex i has bit 0 → +x, bit 1 → +y, bit 2 → +z.
        const vertices: Vec3[] = [];
        for (let i = 0; i < 8; i++) {
            vertices.push(new Vec3(i & 1 ? x : -x, i & 2 ? y : -y, i & 4 ? z : -z));
        }
        super(vertices, [
            [4, 5, 7, 6], // +Z
            [1, 0, 2, 3], // −Z
            [5, 1, 3, 7], // +X
            [0, 4, 6, 2], // −X
            [6, 7, 3, 2], // +Y
            [0, 1, 5, 4], // −Y
        ]);
    }
}

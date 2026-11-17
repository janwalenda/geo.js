import { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';

/**
 * Convex polyhedron centered at the origin, projected onto a sphere of `radius`.
 * Faces are re-oriented to point outwards automatically. With `detail > 0`, every
 * triangle is split into four (`detail` times), giving a geodesic sphere.
 */
export class PolyhedronGeometry extends Geometry {
    constructor(baseVertices: Vec3[], baseFaces: number[][], radius = 1, detail = 0) {
        const vertices = baseVertices.map((v) => v.clone().normalize().scale(radius));
        let faces = baseFaces.map((f) => [...f]);

        for (let level = 0; level < Math.floor(detail); level++) {
            const cache = new Map<string, number>();
            const midpoint = (a: number, b: number): number => {
                const key = a < b ? `${a},${b}` : `${b},${a}`;
                let index = cache.get(key);
                if (index === undefined) {
                    const m = vertices[a].clone().add(vertices[b]).normalize().scale(radius);
                    index = vertices.push(m) - 1;
                    cache.set(key, index);
                }
                return index;
            };
            const next: number[][] = [];
            for (const face of faces) {
                if (face.length !== 3) {
                    next.push(face);
                    continue;
                }
                const [a, b, c] = face;
                const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
                next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
            }
            faces = next;
        }

        super(vertices, faces);

        // Orient every face outwards (the solid is convex and centered at the origin).
        const normal = new Vec3();
        const center = new Vec3();
        for (let i = 0; i < this.faces.length; i++) {
            if (this.faceNormal(i, normal).dot(this.faceCenter(i, center)) < 0) this.faces[i].reverse();
        }
    }
}

/** Regular tetrahedron (4 triangles). */
export class TetrahedronGeometry extends PolyhedronGeometry {
    constructor(radius = 1, detail = 0) {
        super(
            [new Vec3(1, 1, 1), new Vec3(-1, -1, 1), new Vec3(-1, 1, -1), new Vec3(1, -1, -1)],
            [[2, 1, 0], [0, 3, 2], [1, 3, 0], [2, 3, 1]],
            radius,
            detail,
        );
    }
}

/** Regular octahedron (8 triangles). */
export class OctahedronGeometry extends PolyhedronGeometry {
    constructor(radius = 1, detail = 0) {
        super(
            [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, -1, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1)],
            [[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 2, 5], [1, 5, 3], [1, 3, 4], [1, 4, 2]],
            radius,
            detail,
        );
    }
}

/** Regular icosahedron (20 triangles); with `detail > 0` an evenly tessellated "ico sphere". */
export class IcosahedronGeometry extends PolyhedronGeometry {
    constructor(radius = 1, detail = 0) {
        const t = (1 + Math.sqrt(5)) / 2;
        super(
            [
                new Vec3(-1, t, 0), new Vec3(1, t, 0), new Vec3(-1, -t, 0), new Vec3(1, -t, 0),
                new Vec3(0, -1, t), new Vec3(0, 1, t), new Vec3(0, -1, -t), new Vec3(0, 1, -t),
                new Vec3(t, 0, -1), new Vec3(t, 0, 1), new Vec3(-t, 0, -1), new Vec3(-t, 0, 1),
            ],
            [
                [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
                [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
                [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
                [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
            ],
            radius,
            detail,
        );
    }
}

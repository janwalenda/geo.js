import { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';

/**
 * Convex polyhedron centered at the origin, projected onto a sphere of
 * `radius`. Faces are re-oriented to point outwards automatically. With `detail
 * > 0`, every triangle is split into four (`detail` times), giving a geodesic
 * sphere.
 */
export class PolyhedronGeometry extends Geometry {
  constructor(
    baseVertices: Vec3[],
    baseFaces: number[][],
    radius = 1,
    detail = 0,
  ) {
    const vertices = baseVertices.map((v) =>
      v.clone().normalize().scale(radius),
    );
    let faces = baseFaces.map((f) => [...f]);

    for (let level = 0; level < Math.floor(detail); level++) {
      const cache = new Map<string, number>();
      const midpoint = (a: number, b: number): number => {
        const key = a < b ? `${a},${b}` : `${b},${a}`;
        let index = cache.get(key);
        if (index === undefined) {
          const m = vertices[a]
            .clone()
            .add(vertices[b])
            .normalize()
            .scale(radius);
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
        const ab = midpoint(a, b),
          bc = midpoint(b, c),
          ca = midpoint(c, a);
        next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
      }
      faces = next;
    }

    super(vertices, faces);

    // Orient every face outwards (the solid is convex and centered at the
    // origin).
    const normal = new Vec3();
    const center = new Vec3();
    for (let i = 0; i < this.faces.length; i++) {
      if (this.faceNormal(i, normal).dot(this.faceCenter(i, center)) < 0) {
        this.faces[i].reverse();
      }
    }
  }
}

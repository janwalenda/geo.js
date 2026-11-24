import { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';

/**
 * Cylinder (or cone/frustum) along the Y axis, centered at the origin.
 * Caps are single convex polygons; a radius of 0 collapses that end into an
 * apex.
 */
export class CylinderGeometry extends Geometry {
  // eslint-disable-next-line @typescript-eslint/max-params -- public API
  constructor(
    radiusTop = 1,
    radiusBottom = 1,
    height = 1,
    radialSegments = 24,
    openEnded = false,
  ) {
    const n = Math.max(3, Math.floor(radialSegments));
    const y = height / 2;
    const vertices: Vec3[] = [];
    const faces: number[][] = [];

    const ring = (radius: number, yy: number): number[] => {
      if (radius === 0) {
        return new Array<number>(n).fill(vertices.push(new Vec3(0, yy, 0)) - 1);
      }
      const indices: number[] = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        indices.push(
          vertices.push(
            new Vec3(radius * Math.cos(a), yy, -radius * Math.sin(a)),
          ) - 1,
        );
      }
      return indices;
    };
    const top = ring(radiusTop, y);
    const bottom = ring(radiusBottom, -y);

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      // Drop the repeated apex vertex of cones so every face stays a proper
      // polygon.
      const quad = [top[i], bottom[i], bottom[j], top[j]].filter(
        (v, k, all) => all.indexOf(v) === k,
      );
      faces.push(quad);
    }
    if (!openEnded) {
      if (radiusTop > 0) {
        faces.push([...top]);
      }
      if (radiusBottom > 0) {
        faces.push([...bottom].reverse());
      }
    }
    super(vertices, faces);
  }
}

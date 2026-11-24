import type { Mat4 } from '../math/Mat4';
import type { Vec2 } from '../math/Vec2';
import { Vec3 } from '../math/Vec3';

/**
 * Polygon mesh: shared `vertices` and `faces` given as vertex-index lists.
 * Faces may have three or more vertices (quads stay quads, which gives cleaner
 * Canvas/SVG output). Faces are planar, convex and counter-clockwise when seen
 * from the front (outside).
 *
 * `uvs` optionally holds texture coordinates per face corner: `uvs[f][k]`
 * belongs to vertex `faces[f][k]`. Per-corner UVs allow seams (box faces, the
 * wrap of a sphere). Texture space: `(0, 0)` top-left, `(1, 1)` bottom-right of
 * the image.
 */
export class Geometry {
  constructor(
    public vertices: Vec3[] = [],
    public faces: number[][] = [],
    public uvs: Vec2[][] | null = null,
  ) {}

  /**
   * Unit normal of face `index` (Newell's method, robust for any planar
   * polygon).
   */
  faceNormal(index: number, out = new Vec3()): Vec3 {
    out.set(0, 0, 0);
    const face = this.faces[index];
    for (let i = 0; i < face.length; i++) {
      const a = this.vertices[face[i]];
      const b = this.vertices[face[(i + 1) % face.length]];
      out.x += (a.y - b.y) * (a.z + b.z);
      out.y += (a.z - b.z) * (a.x + b.x);
      out.z += (a.x - b.x) * (a.y + b.y);
    }
    return out.normalize();
  }

  /** Centroid of the vertices of face `index`. */
  faceCenter(index: number, out = new Vec3()): Vec3 {
    out.set(0, 0, 0);
    const face = this.faces[index];
    for (const i of face) {
      out.add(this.vertices[i]);
    }
    return out.scale(1 / face.length);
  }

  /** Bake a transform into the vertices. */
  applyMat4(m: Mat4): this {
    for (const v of this.vertices) {
      v.applyMat4(m);
    }
    return this;
  }

  /** Unique undirected edges as index pairs. */
  edges(): [number, number][] {
    const seen = new Set<string>();
    const result: [number, number][] = [];
    for (const face of this.faces) {
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        const key = a < b ? `${a},${b}` : `${b},${a}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push([a, b]);
        }
      }
    }
    return result;
  }

  /** A deep copy of vertices, faces and UVs. */
  clone(): Geometry {
    return new Geometry(
      this.vertices.map((v) => v.clone()),
      this.faces.map((f) => [...f]),
      this.uvs?.map((f) => f.map((uv) => uv.clone())) ?? null,
    );
  }
}

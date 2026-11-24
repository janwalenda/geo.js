import { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';
import { quadGrid } from './helpers';

/**
 * Rectangle in the XY plane centered at the origin, facing +Z, split into a
 * grid of quads. UVs span the whole plane: the image's top-left corner sits
 * at (−x, +y).
 */
export class PlaneGeometry extends Geometry {
  constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
    const nx = Math.max(1, Math.floor(widthSegments));
    const ny = Math.max(1, Math.floor(heightSegments));
    const vertices: Vec3[] = [];
    for (let iy = 0; iy <= ny; iy++) {
      for (let ix = 0; ix <= nx; ix++) {
        const x = (ix / nx - 0.5) * width;
        const y = (iy / ny - 0.5) * height;
        vertices.push(new Vec3(x, y, 0));
      }
    }
    const { faces, uvs } = quadGrid({
      cellsU: nx,
      cellsV: ny,
      columns: nx + 1,
      rows: ny + 1,
    });
    super(vertices, faces, uvs);
  }
}

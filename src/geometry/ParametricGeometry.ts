import type { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';
import { quadGrid } from './helpers';
import type { ParametricFunction, ParametricOptions } from './types';

/**
 * Surface of a function `f(u, v)` sampled on a grid of quads – the general tool
 * for plotting mathematical surfaces. The front side is where `∂f/∂u × ∂f/∂v`
 * points. UVs: texture point `(u, 1 − v)` ↦ `f(u, v)`, so the image reads
 * unmirrored from the front side (image right = ∂f/∂u, image up = ∂f/∂v).
 */
export class ParametricGeometry extends Geometry {
  constructor(fn: ParametricFunction, options: ParametricOptions = {}) {
    const nu = Math.max(1, Math.floor(options.slicesU ?? 16));
    const nv = Math.max(1, Math.floor(options.slicesV ?? 16));
    const closedU = options.closedU ?? false;
    const closedV = options.closedV ?? false;
    const columns = closedU ? nu : nu + 1;
    const rows = closedV ? nv : nv + 1;

    const vertices: Vec3[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < columns; i++) {
        vertices.push(fn(i / nu, j / nv));
      }
    }
    const { faces, uvs } = quadGrid({ cellsU: nu, cellsV: nv, columns, rows });
    super(vertices, faces, uvs);
  }
}

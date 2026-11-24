import type { Vec2 } from '../math/Vec2';
import { toVec2 } from './helpers';
import { Shape2D } from './Shape2D';
import type { PointLike, ShapeOptions } from './types';

/** Closed polygon through the given local points. */
export class Polygon extends Shape2D {
  override readonly closed = true;
  vertices: Vec2[];

  constructor(vertices: PointLike[], options: ShapeOptions = {}) {
    super(options);
    this.vertices = vertices.map(toVec2);
  }

  override localPoints(): Vec2[] {
    return this.vertices.map((v) => v.clone());
  }
}

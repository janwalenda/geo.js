import type { Vec2 } from '../math/Vec2';
import { toVec2 } from './helpers';
import { Shape2D } from './Shape2D';
import type { PointLike, ShapeOptions } from './types';

/** Straight segment between two local points. */
export class Line extends Shape2D {
  override readonly closed = false;
  from: Vec2;
  to: Vec2;

  constructor(from: PointLike, to: PointLike, options: ShapeOptions = {}) {
    super(options);
    this.from = toVec2(from);
    this.to = toVec2(to);
  }

  override localPoints(): Vec2[] {
    return [this.from.clone(), this.to.clone()];
  }
}

import { Vec2 } from '../math/Vec2';
import { Shape2D } from './Shape2D';
import type { RegularPolygonOptions } from './types';

/** Regular n-gon centered on its position, first vertex pointing up. */
export class RegularPolygon extends Shape2D {
  override readonly closed = true;
  radius: number;
  sides: number;

  constructor(options: RegularPolygonOptions) {
    super(options);
    this.radius = options.radius;
    this.sides = Math.max(3, Math.floor(options.sides));
  }

  override localPoints(): Vec2[] {
    const points: Vec2[] = [];
    for (let i = 0; i < this.sides; i++) {
      const a = -Math.PI / 2 + (i / this.sides) * Math.PI * 2;
      points.push(
        new Vec2(Math.cos(a) * this.radius, Math.sin(a) * this.radius),
      );
    }
    return points;
  }
}

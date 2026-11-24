import { Vec2 } from '../math/Vec2';
import { Shape2D } from './Shape2D';
import type { EllipseOptions } from './types';

/** Ellipse centered on its position. */
export class Ellipse extends Shape2D {
  override readonly closed = true;
  radiusX: number;
  radiusY: number;
  segments: number;

  constructor(options: EllipseOptions) {
    super(options);
    this.radiusX = options.radiusX;
    this.radiusY = options.radiusY;
    this.segments = Math.max(3, Math.floor(options.segments ?? 64));
  }

  override localPoints(): Vec2[] {
    const points: Vec2[] = [];
    for (let i = 0; i < this.segments; i++) {
      const a = (i / this.segments) * Math.PI * 2;
      points.push(
        new Vec2(Math.cos(a) * this.radiusX, Math.sin(a) * this.radiusY),
      );
    }
    return points;
  }
}

import { Vec2 } from '../math/Vec2';
import { Shape2D } from './Shape2D';
import type { FunctionGraphOptions } from './types';

/**
 * Graph of `y = f(x)` in math coordinates (y up) around its position, which
 * marks the math origin. Non-finite values (poles, outside the domain) are
 * skipped.
 */
export class FunctionGraph extends Shape2D {
  override readonly closed = false;
  fn: (x: number) => number;
  xMin: number;
  xMax: number;
  samples: number;
  unit: number;

  constructor(options: FunctionGraphOptions) {
    super(options);
    this.fn = options.fn;
    this.xMin = options.xMin ?? -1;
    this.xMax = options.xMax ?? 1;
    this.samples = Math.max(2, Math.floor(options.samples ?? 200));
    this.unit = options.unit ?? 50;
  }

  override localPoints(): Vec2[] {
    const points: Vec2[] = [];
    for (let i = 0; i < this.samples; i++) {
      const x = this.xMin + ((this.xMax - this.xMin) * i) / (this.samples - 1);
      const y = this.fn(x);
      if (Number.isFinite(y)) {
        points.push(new Vec2(x * this.unit, -y * this.unit));
      }
    }
    return points;
  }
}

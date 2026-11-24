import { Vec2 } from '../math/Vec2';
import { Shape2D } from './Shape2D';
import type { ParametricCurveOptions } from './types';

/**
 * Parametric curve `t ↦ (x(t), y(t))` in math coordinates (y up), e.g.
 * Lissajous figures.
 */
export class ParametricCurve extends Shape2D {
  override readonly closed: boolean;
  fn: (t: number) => readonly [number, number];
  tMin: number;
  tMax: number;
  samples: number;
  unit: number;

  constructor(options: ParametricCurveOptions) {
    super(options);
    this.fn = options.fn;
    this.tMin = options.tMin ?? 0;
    this.tMax = options.tMax ?? Math.PI * 2;
    this.samples = Math.max(2, Math.floor(options.samples ?? 200));
    this.unit = options.unit ?? 50;
    this.closed = options.closed ?? false;
  }

  override localPoints(): Vec2[] {
    const points: Vec2[] = [];
    const last = this.closed ? this.samples : this.samples - 1;
    for (let i = 0; i < this.samples; i++) {
      const t = this.tMin + ((this.tMax - this.tMin) * i) / last;
      const [x, y] = this.fn(t);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        points.push(new Vec2(x * this.unit, -y * this.unit));
      }
    }
    return points;
  }
}

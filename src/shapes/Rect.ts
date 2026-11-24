import { Vec2 } from '../math/Vec2';
import { Shape2D } from './Shape2D';
import type { RectOptions } from './types';

/** Rectangle centered on its position. */
export class Rect extends Shape2D {
  override readonly closed = true;
  width: number;
  height: number;

  constructor(options: RectOptions) {
    super(options);
    this.width = options.width;
    this.height = options.height;
  }

  override localPoints(): Vec2[] {
    const w = this.width / 2,
      h = this.height / 2;
    return [new Vec2(-w, -h), new Vec2(w, -h), new Vec2(w, h), new Vec2(-w, h)];
  }
}

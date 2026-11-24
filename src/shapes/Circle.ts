import { Vec2 } from '../math/Vec2';
import type { ShapePrimitive } from '../render/types';
import { Shape2D } from './Shape2D';
import type { CircleOptions } from './types';

/**
 * Circle or circular arc. A full circle with uniform scale is emitted as an
 * exact circle primitive (`<circle>` in SVG, `arc()` on canvas); arcs become
 * line strips.
 */
export class Circle extends Shape2D {
  radius: number;
  start: number;
  end: number;
  segments: number;
  closeArc: boolean;

  constructor(options: CircleOptions) {
    super(options);
    this.radius = options.radius;
    this.start = options.start ?? 0;
    this.end = options.end ?? Math.PI * 2;
    this.segments = Math.max(3, Math.floor(options.segments ?? 64));
    this.closeArc = options.closeArc ?? false;
  }

  /** Whether start and end span a full turn (a closed circle, not an arc). */
  get isFull(): boolean {
    return Math.abs(this.end - this.start) >= Math.PI * 2;
  }

  override get closed(): boolean {
    return this.isFull || this.closeArc;
  }

  override localPoints(): Vec2[] {
    const sweep =
      Math.min(Math.abs(this.end - this.start), Math.PI * 2) *
      Math.sign(this.end - this.start);
    const steps = Math.max(
      1,
      Math.ceil((this.segments * Math.abs(sweep)) / (Math.PI * 2)),
    );
    const count = this.isFull ? steps : steps + 1;
    const points: Vec2[] = [];
    for (let i = 0; i < count; i++) {
      const a = this.start + (sweep * i) / steps;
      points.push(
        new Vec2(Math.cos(a) * this.radius, Math.sin(a) * this.radius),
      );
    }
    return points;
  }

  override toPrimitives(): ShapePrimitive[] {
    if (this.visible && this.isFull && this.scale.x === this.scale.y) {
      return [
        {
          type: 'circle',
          x: this.position.x,
          y: this.position.y,
          radius: this.radius * Math.abs(this.scale.x),
          depth: 0,
          ...this.style(),
        },
      ];
    }
    return super.toPrimitives();
  }
}

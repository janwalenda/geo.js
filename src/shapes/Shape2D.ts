import { Mat3 } from '../math/Mat3';
import { Vec2 } from '../math/Vec2';
import type { Drawable, PrimitiveStyle, ShapePrimitive } from '../render/types';
import { Color } from '../scene/Color';
import { toVec2 } from './helpers';
import type { ShapeOptions } from './types';

/**
 * Base class of all 2D shapes. A shape is an outline in local coordinates
 * plus a transform `T · R · S`; it contributes primitives to a display list,
 * so it looks the same in every renderer. Draw shapes with
 * `renderer.render2D([...])` or as an overlay of a 3D scene:
 * `renderer.render(scene, camera, [...shapes])`.
 */
export abstract class Shape2D implements Drawable {
  readonly position: Vec2;
  rotation: number;
  readonly scale: Vec2;
  fill: Color | null;
  stroke: Color | null;
  lineWidth: number;
  opacity: number;
  visible = true;

  /** Closed shapes are filled polygons; open ones are polylines. */
  abstract readonly closed: boolean;

  protected constructor(options: ShapeOptions = {}) {
    this.position = toVec2(options.position ?? [0, 0]);
    this.rotation = options.rotation ?? 0;
    const s = options.scale ?? 1;
    this.scale = typeof s === 'number' ? new Vec2(s, s) : toVec2(s);
    const fill = options.fill ?? null;
    this.fill = fill === null ? null : Color.from(fill);
    const stroke = options.stroke === undefined ? '#000000' : options.stroke;
    this.stroke = stroke === null ? null : Color.from(stroke);
    this.lineWidth = options.lineWidth ?? 1;
    this.opacity = options.opacity ?? 1;
  }

  /** Local → screen transform `T · R · S`. */
  matrix(): Mat3 {
    return new Mat3()
      .makeTranslation(this.position.x, this.position.y)
      .multiply(new Mat3().makeRotation(this.rotation))
      .multiply(new Mat3().makeScale(this.scale.x, this.scale.y));
  }

  /** Outline in screen coordinates. */
  points(): Vec2[] {
    const m = this.matrix();
    return this.localPoints().map((p) => p.applyMat3(m));
  }

  /** The shape as display list primitives (none if hidden or empty). */
  toPrimitives(): ShapePrimitive[] {
    const points = this.points().flatMap((p) => [p.x, p.y]);
    if (!this.visible || points.length < 4) {
      return [];
    }
    const style = this.style();
    return this.closed
      ? [{ type: 'polygon', points, depth: 0, ...style }]
      : [{ type: 'polyline', points, closed: false, depth: 0, ...style }];
  }

  /** Resolved style; open shapes are never filled. */
  protected style(): PrimitiveStyle {
    return {
      fill: this.closed ? (this.fill?.toCSS() ?? null) : null,
      stroke: this.stroke?.toCSS() ?? null,
      lineWidth: this.lineWidth,
      opacity: this.opacity,
    };
  }

  /** Outline in local coordinates (before position/rotation/scale). */
  abstract localPoints(): Vec2[];
}

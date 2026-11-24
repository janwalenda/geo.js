import { Mat3 } from '../math/Mat3';
import { Vec2 } from '../math/Vec2';
import type { Drawable, PrimitiveStyle, ShapePrimitive } from '../render/DisplayList';
import { Color, type ColorLike } from '../scene/Color';

/** A 2D point given as a vector, a tuple or any `{ x, y }` object. */
export type PointLike = Vec2 | readonly [number, number] | { x: number; y: number };

/** Convert a {@link PointLike} into a new {@link Vec2}. */
export function toVec2(p: PointLike): Vec2 {
    return Array.isArray(p) ? new Vec2(p[0], p[1]) : new Vec2((p as Vec2).x, (p as Vec2).y);
}

export interface ShapeOptions {
    /** Position in CSS pixels (origin top-left, y down). Default `[0, 0]`. */
    position?: PointLike;
    /** Clockwise rotation on screen in radians. Default `0`. */
    rotation?: number;
    /** Uniform or per-axis scale. Default `1`. */
    scale?: number | PointLike;
    /** Fill color or `null`. Default `null`. */
    fill?: ColorLike | null;
    /** Outline color or `null`. Default `'#000000'`. */
    stroke?: ColorLike | null;
    /** Outline width in CSS pixels. Default `1`. */
    lineWidth?: number;
    /** Opacity in [0, 1]. Default `1`. */
    opacity?: number;
}

/**
 * Base class of all 2D shapes. A shape is an outline in local coordinates plus a
 * transform `T · R · S`; it contributes primitives to a display list, so it looks
 * the same in every renderer. Draw shapes with `renderer.render2D([...])` or as an
 * overlay of a 3D scene: `renderer.render(scene, camera, [...shapes])`.
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
        this.fill = options.fill == null ? null : Color.from(options.fill);
        this.stroke = options.stroke === null ? null : Color.from(options.stroke ?? '#000000');
        this.lineWidth = options.lineWidth ?? 1;
        this.opacity = options.opacity ?? 1;
    }

    /** Outline in local coordinates (before position/rotation/scale). */
    abstract localPoints(): Vec2[];

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

    protected style(): PrimitiveStyle {
        return {
            fill: this.closed ? this.fill?.toCSS() ?? null : null,
            stroke: this.stroke?.toCSS() ?? null,
            lineWidth: this.lineWidth,
            opacity: this.opacity,
        };
    }

    toPrimitives(): ShapePrimitive[] {
        if (!this.visible) return [];
        const points = this.points().flatMap((p) => [p.x, p.y]);
        if (points.length < 4) return [];
        return this.closed
            ? [{ type: 'polygon', points, depth: 0, ...this.style() }]
            : [{ type: 'polyline', points, closed: false, depth: 0, ...this.style() }];
    }
}

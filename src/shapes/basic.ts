import { Vec2 } from '../math/Vec2';
import type { Primitive } from '../render/DisplayList';
import { Shape2D, toVec2, type PointLike, type ShapeOptions } from './Shape2D';

/** Closed polygon through the given local points. */
export class Polygon extends Shape2D {
    readonly closed = true;
    vertices: Vec2[];

    constructor(vertices: PointLike[], options: ShapeOptions = {}) {
        super(options);
        this.vertices = vertices.map(toVec2);
    }

    localPoints(): Vec2[] {
        return this.vertices.map((v) => v.clone());
    }
}

/** Open line strip through the given local points. */
export class Polyline2D extends Shape2D {
    readonly closed = false;
    vertices: Vec2[];

    constructor(vertices: PointLike[], options: ShapeOptions = {}) {
        super(options);
        this.vertices = vertices.map(toVec2);
    }

    localPoints(): Vec2[] {
        return this.vertices.map((v) => v.clone());
    }
}

/** Straight segment between two local points. */
export class Line extends Shape2D {
    readonly closed = false;
    from: Vec2;
    to: Vec2;

    constructor(from: PointLike, to: PointLike, options: ShapeOptions = {}) {
        super(options);
        this.from = toVec2(from);
        this.to = toVec2(to);
    }

    localPoints(): Vec2[] {
        return [this.from.clone(), this.to.clone()];
    }
}

export interface RectOptions extends ShapeOptions {
    width: number;
    height: number;
}

/** Rectangle centered on its position. */
export class Rect extends Shape2D {
    readonly closed = true;
    width: number;
    height: number;

    constructor(options: RectOptions) {
        super(options);
        this.width = options.width;
        this.height = options.height;
    }

    localPoints(): Vec2[] {
        const w = this.width / 2, h = this.height / 2;
        return [new Vec2(-w, -h), new Vec2(w, -h), new Vec2(w, h), new Vec2(-w, h)];
    }
}

export interface EllipseOptions extends ShapeOptions {
    radiusX: number;
    radiusY: number;
    /** Number of outline segments. Default `64`. */
    segments?: number;
}

/** Ellipse centered on its position. */
export class Ellipse extends Shape2D {
    readonly closed = true;
    radiusX: number;
    radiusY: number;
    segments: number;

    constructor(options: EllipseOptions) {
        super(options);
        this.radiusX = options.radiusX;
        this.radiusY = options.radiusY;
        this.segments = Math.max(3, Math.floor(options.segments ?? 64));
    }

    localPoints(): Vec2[] {
        const points: Vec2[] = [];
        for (let i = 0; i < this.segments; i++) {
            const a = (i / this.segments) * Math.PI * 2;
            points.push(new Vec2(Math.cos(a) * this.radiusX, Math.sin(a) * this.radiusY));
        }
        return points;
    }
}

export interface CircleOptions extends ShapeOptions {
    radius: number;
    /** Start angle in radians (clockwise on screen from +x). Default `0`. */
    start?: number;
    /** End angle in radians. Default `2π` (full circle). */
    end?: number;
    /** Number of segments for a full turn when drawn as an outline. Default `64`. */
    segments?: number;
    /** For arcs: close the outline with a chord and fill it. Default `false`. */
    closeArc?: boolean;
}

/**
 * Circle or circular arc. A full circle with uniform scale is emitted as an exact
 * circle primitive (`<circle>` in SVG, `arc()` on canvas); arcs become line strips.
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

    get isFull(): boolean {
        return Math.abs(this.end - this.start) >= Math.PI * 2;
    }

    get closed(): boolean {
        return this.isFull || this.closeArc;
    }

    localPoints(): Vec2[] {
        const sweep = Math.min(Math.abs(this.end - this.start), Math.PI * 2) * Math.sign(this.end - this.start);
        const steps = Math.max(1, Math.ceil((this.segments * Math.abs(sweep)) / (Math.PI * 2)));
        const count = this.isFull ? steps : steps + 1;
        const points: Vec2[] = [];
        for (let i = 0; i < count; i++) {
            const a = this.start + (sweep * i) / steps;
            points.push(new Vec2(Math.cos(a) * this.radius, Math.sin(a) * this.radius));
        }
        return points;
    }

    toPrimitives(): Primitive[] {
        if (this.visible && this.isFull && this.scale.x === this.scale.y) {
            return [{
                type: 'circle',
                x: this.position.x,
                y: this.position.y,
                radius: this.radius * Math.abs(this.scale.x),
                depth: 0,
                ...this.style(),
            }];
        }
        return super.toPrimitives();
    }
}

export interface RegularPolygonOptions extends ShapeOptions {
    /** Circumradius in pixels. */
    radius: number;
    sides: number;
}

/** Regular n-gon centered on its position, first vertex pointing up. */
export class RegularPolygon extends Shape2D {
    readonly closed = true;
    radius: number;
    sides: number;

    constructor(options: RegularPolygonOptions) {
        super(options);
        this.radius = options.radius;
        this.sides = Math.max(3, Math.floor(options.sides));
    }

    localPoints(): Vec2[] {
        const points: Vec2[] = [];
        for (let i = 0; i < this.sides; i++) {
            const a = -Math.PI / 2 + (i / this.sides) * Math.PI * 2;
            points.push(new Vec2(Math.cos(a) * this.radius, Math.sin(a) * this.radius));
        }
        return points;
    }
}

import { Vec2 } from '../math/Vec2';
import { Shape2D, type ShapeOptions } from './Shape2D';

export interface FunctionGraphOptions extends ShapeOptions {
    /** y = fn(x) in math units. */
    fn: (x: number) => number;
    /** Domain start. Default `-1`. */
    xMin?: number;
    /** Domain end. Default `1`. */
    xMax?: number;
    /** Number of samples. Default `200`. */
    samples?: number;
    /** Pixels per math unit (on both axes). Default `50`. */
    unit?: number;
}

/**
 * Graph of `y = f(x)` in math coordinates (y up) around its position, which marks
 * the math origin. Non-finite values (poles, outside the domain) are skipped.
 */
export class FunctionGraph extends Shape2D {
    readonly closed = false;
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

    localPoints(): Vec2[] {
        const points: Vec2[] = [];
        for (let i = 0; i < this.samples; i++) {
            const x = this.xMin + ((this.xMax - this.xMin) * i) / (this.samples - 1);
            const y = this.fn(x);
            if (Number.isFinite(y)) points.push(new Vec2(x * this.unit, -y * this.unit));
        }
        return points;
    }
}

export interface ParametricCurveOptions extends ShapeOptions {
    /** (x, y) = fn(t) in math units. */
    fn: (t: number) => readonly [number, number];
    /** Default `0`. */
    tMin?: number;
    /** Default `2π`. */
    tMax?: number;
    /** Default `200`. */
    samples?: number;
    /** Pixels per math unit. Default `50`. */
    unit?: number;
    /** Treat the curve as a closed, fillable outline. Default `false`. */
    closed?: boolean;
}

/** Parametric curve `t ↦ (x(t), y(t))` in math coordinates (y up), e.g. Lissajous figures. */
export class ParametricCurve extends Shape2D {
    readonly closed: boolean;
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

    localPoints(): Vec2[] {
        const points: Vec2[] = [];
        const last = this.closed ? this.samples : this.samples - 1;
        for (let i = 0; i < this.samples; i++) {
            const t = this.tMin + ((this.tMax - this.tMin) * i) / last;
            const [x, y] = this.fn(t);
            if (Number.isFinite(x) && Number.isFinite(y)) points.push(new Vec2(x * this.unit, -y * this.unit));
        }
        return points;
    }
}

export interface SineWaveOptions extends ShapeOptions {
    /** Peak height in pixels. Default `20`. */
    amplitude?: number;
    /** Length of one period in pixels. Default `100`. */
    wavelength?: number;
    /** Phase shift in radians. Default `0`. */
    phase?: number;
    /** Total length in pixels, starting at the position. Default `wavelength`. */
    length?: number;
    /** Samples per wavelength. Default `48`. */
    resolution?: number;
}

/** Sine wave starting at its position and running along +x. */
export class SineWave extends FunctionGraph {
    constructor(options: SineWaveOptions = {}) {
        const amplitude = options.amplitude ?? 20;
        const wavelength = options.wavelength ?? 100;
        const phase = options.phase ?? 0;
        const length = options.length ?? wavelength;
        const resolution = options.resolution ?? 48;
        super({
            ...options,
            fn: (x) => amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase),
            xMin: 0,
            xMax: length,
            unit: 1,
            samples: Math.max(2, Math.ceil((length / wavelength) * resolution) + 1),
        });
    }
}

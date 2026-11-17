import type { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';

/** Surface point for parameters `u, v ∈ [0, 1]`. */
export type ParametricFunction = (u: number, v: number) => Vec3;

export interface ParametricOptions {
    /** Number of quads along u. Default `16`. */
    slicesU?: number;
    /** Number of quads along v. Default `16`. */
    slicesV?: number;
    /** f(1, v) = f(0, v): reuse the first column instead of duplicating it. Default `false`. */
    closedU?: boolean;
    /** f(u, 1) = f(u, 0): reuse the first row instead of duplicating it. Default `false`. */
    closedV?: boolean;
}

/**
 * Surface of a function `f(u, v)` sampled on a grid of quads – the general tool for
 * plotting mathematical surfaces. The front side is where `∂f/∂u × ∂f/∂v` points.
 */
export class ParametricGeometry extends Geometry {
    constructor(fn: ParametricFunction, options: ParametricOptions = {}) {
        const nu = Math.max(1, Math.floor(options.slicesU ?? 16));
        const nv = Math.max(1, Math.floor(options.slicesV ?? 16));
        const closedU = options.closedU ?? false;
        const closedV = options.closedV ?? false;
        const columns = closedU ? nu : nu + 1;
        const rows = closedV ? nv : nv + 1;

        const vertices: Vec3[] = [];
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < columns; i++) vertices.push(fn(i / nu, j / nv));
        }
        const index = (i: number, j: number) => (j % rows) * columns + (i % columns);
        const faces: number[][] = [];
        for (let j = 0; j < nv; j++) {
            for (let i = 0; i < nu; i++) {
                faces.push([index(i, j), index(i + 1, j), index(i + 1, j + 1), index(i, j + 1)]);
            }
        }
        super(vertices, faces);
    }
}

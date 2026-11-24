import type { Vec2 } from '../math/Vec2';
import type { Vec3 } from '../math/Vec3';

/** Surface point for parameters `u, v ∈ [0, 1]`. */
export type ParametricFunction = (u: number, v: number) => Vec3;

/** Options of {@link ParametricGeometry}. */
export interface ParametricOptions {
  /** Number of quads along u. Default `16`. */
  slicesU?: number;
  /** Number of quads along v. Default `16`. */
  slicesV?: number;
  /**
   * f(1, v) = f(0, v): reuse the first column instead of duplicating it.
   * Default `false`.
   */
  closedU?: boolean;
  /**
   * f(u, 1) = f(u, 0): reuse the first row instead of duplicating it.
   * Default `false`.
   */
  closedV?: boolean;
}

/** Quad faces and their texture coordinates, one entry per face. */
export interface QuadGrid {
  faces: number[][];
  uvs: Vec2[][];
}

/** Size of a vertex grid: cells to cover and vertices per row/column. */
export interface GridSize {
  /** Quads along u. */
  cellsU: number;
  /** Quads along v. */
  cellsV: number;
  /** Vertices per row; `cellsU` if the grid wraps around in u. */
  columns: number;
  /** Vertex rows; `cellsV` if the grid wraps around in v. */
  rows: number;
}

import type { Vec2 } from '../math/Vec2';
import type { ColorLike } from '../scene/types';

/** A 2D point given as a vector, a tuple or any `{ x, y }` object. */
export type PointLike =
  Vec2 | readonly [number, number] | { x: number; y: number };

/** Options shared by all {@link Shape2D}s. */
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

/** Options of {@link Rect}. */
export interface RectOptions extends ShapeOptions {
  width: number;
  height: number;
}

/** Options of {@link Ellipse}. */
export interface EllipseOptions extends ShapeOptions {
  radiusX: number;
  radiusY: number;
  /** Number of outline segments. Default `64`. */
  segments?: number;
}

/** Options of {@link Circle}. */
export interface CircleOptions extends ShapeOptions {
  radius: number;
  /** Start angle in radians (clockwise on screen from +x). Default `0`. */
  start?: number;
  /** End angle in radians. Default `2π` (full circle). */
  end?: number;
  /**
   * Number of segments for a full turn when drawn as an outline. Default `64`.
   */
  segments?: number;
  /** For arcs: close the outline with a chord and fill it. Default `false`. */
  closeArc?: boolean;
}

/** Options of {@link RegularPolygon}. */
export interface RegularPolygonOptions extends ShapeOptions {
  /** Circumradius in pixels. */
  radius: number;
  sides: number;
}

/** Options of {@link FunctionGraph}. */
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

/** Options of {@link ParametricCurve}. */
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

/** Options of {@link SineWave}. */
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

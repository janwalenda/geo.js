/**
 * geo – a math-based 2D/3D engine that renders to Canvas and SVG.
 *
 * This file is the public entry point of the npm package and of the
 * browser bundles. Everything exported here is public API.
 */

// Math
export { Vector2, Vector3 } from './classes/Vector';
export { Matrix3 } from './classes/Matrix3';
export { Percent } from './classes/Percent';
export { project } from './functions/Project';

// Geometry primitives
export { Face } from './classes/Face';
export { Triangle } from './classes/Triangle';

// Scene & output
export { Screen } from './classes/Screen';
export { Group } from './classes/Group';

// 2D shapes
export { Geo2D } from './shapes/Geo2D';
export { Circle, Line, Rect, SineWave } from './shapes';

// 3D figures
export { Geo3D } from './figures/Geo3D';
export { Cube, IcoSphere, Plane, Square, UVSphere } from './figures';

// Helpers
export { create, download, view } from './helpers';

// Types
export { ScreenType } from './types';
export type { Style, StyleProps, CreateNSOptions } from './types';
export type { CircleOptions, RectOptions, SineWaveOptions } from './interfaces';

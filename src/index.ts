/**
 * geo – a math-based 2D/3D engine that renders to Canvas and SVG.
 *
 * This file is the public entry point of the npm package and of the
 * browser bundles. Everything exported here is public API.
 */

// Math core
export * from './math';

// Scene graph
export * from './scene';
export * from './geometry';

// 2D shapes
export * from './shapes';

// Render pipeline
export * from './render';

// Renderers (the only DOM-dependent layer)
export * from './renderers';

// Legacy 3D API (superseded by the modules above, removed before 1.0)
export { Vector2, Vector3 } from './classes/Vector';
export { Matrix3 } from './classes/Matrix3';
export { Percent } from './classes/Percent';
export { project } from './functions/Project';
export { Face } from './classes/Face';
export { Triangle } from './classes/Triangle';
export { Geo3D } from './figures/Geo3D';
export { Cube, IcoSphere, Plane, Square, UVSphere } from './figures';
export { create, download, view } from './helpers';

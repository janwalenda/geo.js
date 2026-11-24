/**
 * geo – a math-based 2D/3D engine that renders to Canvas and SVG.
 *
 * This file is the public entry point of the npm package and of the
 * browser bundles. Everything exported here is public API.
 */

// Math core
export * from './math';

// Scene graph
export * from './geometry';
export * from './scene';

// 2D shapes
export * from './shapes';

// Render pipeline
export * from './render';

// Renderers (the only DOM-dependent layer)
export * from './renderers';

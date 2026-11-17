# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project uses [Semantic Versioning](https://semver.org/) (before 1.0.0, minor
versions may contain breaking changes).

## [Unreleased]

## [0.1.0] - 2026-11-17

Complete rewrite of the engine on a tested mathematical core.

### Added
- npm package `@janwalenda/geo` with ESM, CommonJS, minified ESM and minified UMD bundles plus bundled type declarations (built with Rollup)
- Math core: `Vec2`, `Vec3`, `Vec4`, `Mat3`, `Mat4`, `Quat` and helpers (`degToRad`, `clamp`, …)
- Scene graph: `Object3D`, `Scene`, `Mesh`, `Polyline`, `Points`, `PerspectiveCamera`, `OrthographicCamera`, `AmbientLight`, `DirectionalLight`, `PointLight`, `Material`, `Color`
- Geometry: `BoxGeometry`, `PlaneGeometry`, `UVSphereGeometry`, `TetrahedronGeometry`, `OctahedronGeometry`, `IcosahedronGeometry`, `TorusGeometry`, `CylinderGeometry`, `ConeGeometry`, `ParametricGeometry`
- Render pipeline `compile()` → `DisplayList` with near-plane clipping, back-face culling, flat shading and depth sorting; `projectPoint()`
- `CanvasRenderer`, `SVGRenderer`, `toSVGString()` (DOM-free) and `animate()`
- 2D shapes: `Circle`, `Ellipse`, `Rect`, `Polygon`, `Polyline2D`, `Line`, `RegularPolygon`, `FunctionGraph`, `ParametricCurve`, `SineWave`
- Demo showing the same scene in Canvas and SVG side by side
- Vitest test suite, CI for all Git Flow branches, project rules for Claude Code and Cursor

### Changed
- **Breaking:** the whole public API. The old classes (`Geo2D`, `Geo3D`, `Cube`, `Square`, `Plane`, `UVSphere`, `IcoSphere`, `Vector2`, `Vector3`, `Matrix3`, `Face`, `Triangle`, `Group`, `Screen`, `ScreenType`, `Percent`, the DOM helpers) were removed
- Upgraded to TypeScript 5 and Vite 8; Vite now only serves the demo

### Fixed
- `tsc` failed on `Geo2D` style typing, so the project could not be built
- SVG paths were filled black while canvas only stroked them
- Wrong rotation matrices for arbitrary axes, flipped triangle normals after rotation, broken icosphere subdivision, and UV spheres without faces (all fixed by the rewrite)

[Unreleased]: https://github.com/janwalenda/geo.js/compare/v0.1.0...develop
[0.1.0]: https://github.com/janwalenda/geo.js/releases/tag/v0.1.0

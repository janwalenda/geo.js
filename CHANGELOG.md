# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project uses [Semantic Versioning](https://semver.org/) (before 1.0.0, minor
versions may contain breaking changes).

## [Unreleased]

### Added
- Export of the current frame on every renderer: `download(filename?)`, `createDownloadLink({ filename, text })`, `toBlob()`, `toDataURL()`, plus `mimeType` and `fileExtension`
- `SVGRenderer` exports SVG and gains `toSVGString()` for the live `<svg>` element
- `CanvasRenderer` exports PNG by default; new options `imageType` (`'image/png' | 'image/jpeg' | 'image/webp'`) and `imageQuality`; new type `CanvasImageType`
- Demo: "Download PNG" / "Download SVG" buttons

### Changed
- CI uses `actions/checkout@v7` and `actions/setup-node@v7` (Node 24 runtime instead of the deprecated Node 20)

## [0.1.1] - 2026-11-17

Maintenance release with no changes to the public API.

### Changed
- Tests moved from `src/` to `test/`, mirroring the `src/` layout; a structure test enforces it
- `@types/node` added as a dev dependency so the test TypeScript project type-checks
- Project rules: commit identity, tests required for every feature/fix, branches pushed and CI green before merging, documented frozen legacy branches

### Removed
- `geo.code-workspace` is no longer tracked (local editor file, already in `.gitignore`)

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

[Unreleased]: https://github.com/janwalenda/geo.js/compare/v0.1.1...develop
[0.1.1]: https://github.com/janwalenda/geo.js/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/janwalenda/geo.js/releases/tag/v0.1.0

# geo.js

A math-based 3D engine (plus 2D shapes) written in TypeScript. It renders the
**same scene to Canvas 2D and SVG** with the same output, and needs no WebGL.

- **Math core:** `Vec2`/`Vec3`/`Vec4`, `Mat3`/`Mat4`, `Quat`. Right-handed coordinates, column-major matrices, radians
- **Scene graph:** `Object3D` hierarchy, perspective and orthographic cameras, ambient, directional and point lights
- **Geometry:** box, plane, UV sphere, tetra-, octa- and icosahedron (geodesic), torus, cylinder, cone, and `ParametricGeometry` for any surface `f(u, v)`
- **Pipeline:** near-plane clipping, projection, back-face culling, flat shading and painter's sorting into a renderer-neutral **display list**
- **Renderers:** `CanvasRenderer` (high-DPI), `SVGRenderer` (reuses elements between frames) and `toSVGString` (no DOM, for Node and SSR)
- **Export:** save any frame as SVG or PNG/JPEG/WebP – as a download, a download link, a `Blob` or a data URL
- **2D:** `Circle`, `Rect`, `Ellipse`, `Polygon`, `Line`, `RegularPolygon`, `FunctionGraph`, `ParametricCurve`, `SineWave`

## Installation

```bash
npm install @janwalenda/geo
```

## Quick start

```ts
import {
  AmbientLight,
  CanvasRenderer,
  DirectionalLight,
  IcosahedronGeometry,
  Material,
  Mesh,
  PerspectiveCamera,
  SVGRenderer,
  Scene,
  Vec3,
  animate,
} from '@janwalenda/geo';

const scene = new Scene({ background: '#ffffff' });
const ball = new Mesh(
  new IcosahedronGeometry(1, 2),
  new Material({ fill: '#4f7cff' }),
);
const sun = new DirectionalLight('#ffffff', 0.9);
sun.position.set(3, 5, 4);
scene.add(ball, new AmbientLight('#ffffff', 0.3), sun);

const camera = new PerspectiveCamera({ fov: 45 });
camera.position.set(0, 1.5, 5);
camera.lookAt(new Vec3(0, 0, 0));

// Pick a renderer – or use both, they draw the same image.
const renderer = new CanvasRenderer({ width: 640, height: 480 }); // or new SVGRenderer(...)
document.body.appendChild(renderer.domElement);

animate((time) => {
  ball.rotation.setFromEuler(0, time, 0);
  renderer.render(scene, camera);
});
```

### 2D shapes and overlays

```ts
import { Circle, FunctionGraph, SVGRenderer } from '@janwalenda/geo';

const renderer = new SVGRenderer({ width: 300, height: 200 });
renderer.render2D(
  [
    new FunctionGraph({
      fn: Math.sin,
      xMin: -Math.PI,
      xMax: Math.PI,
      unit: 40,
      position: [150, 100],
      stroke: 'red',
    }),
    new Circle({
      position: [150, 100],
      radius: 4,
      fill: 'black',
      stroke: null,
    }),
  ],
  '#ffffff',
);

// 2D shapes can also be drawn on top of a 3D scene:
// renderer.render(scene, camera, [new Circle({ ... })]);
```

### Downloading a frame (SVG, PNG, …)

Every renderer can export the frame it has drawn last. `SVGRenderer` exports SVG,
`CanvasRenderer` exports PNG by default (or `image/jpeg` / `image/webp` via `imageType`)
at full high-DPI resolution.

```ts
import { CanvasRenderer, Circle, SVGRenderer } from '@janwalenda/geo';

const svg = new SVGRenderer({ width: 300, height: 200 });
svg.render2D(
  [new Circle({ position: [150, 100], radius: 40, fill: '#4f7cff' })],
  '#ffffff',
);

// A ready-made <a download> link with a snapshot of the current frame
document.body.appendChild(
  svg.createDownloadLink({ filename: 'circle.svg', text: 'Save SVG' }),
);

// Or trigger the download directly, e.g. from a button
button.addEventListener('click', () => svg.download('circle.svg'));

const canvas = new CanvasRenderer({
  width: 300,
  height: 200,
  imageType: 'image/png',
});
await canvas.download('scene.png'); // → scene.png
const blob = await canvas.toBlob(); // e.g. for upload
const url = canvas.toDataURL(); // data:image/png;base64,…
const markup = svg.toSVGString(); // '<svg xmlns=…>…</svg>'
```

`createDownloadLink()` uses a `data:` URL, so the link needs no cleanup and keeps
the frame it was created from. `download()` uses a temporary object URL instead,
which also works for very large canvases. JPEG has no transparency – give the scene a
`background` when exporting JPEG.

### Server-side rendering / export (no DOM)

```ts
import {
  BoxGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  Vec3,
  compile,
  toSVGString,
} from '@janwalenda/geo';

const scene = new Scene().add(new Mesh(new BoxGeometry()));
const camera = new PerspectiveCamera();
camera.position.set(2, 2, 3);
camera.lookAt(new Vec3());

const svg = toSVGString(compile(scene, camera, { width: 400, height: 300 }));
// → '<svg xmlns="http://www.w3.org/2000/svg" …>…</svg>'
```

### Mathematical surfaces

```ts
import { Material, Mesh, ParametricGeometry, Vec3 } from '@janwalenda/geo';

// z = sin(x) · cos(y) over [-3, 3]²; the front side is where ∂f/∂u × ∂f/∂v points
const surface = new Mesh(
  new ParametricGeometry(
    (u, v) => {
      const x = (u - 0.5) * 6,
        y = (v - 0.5) * 6;
      return new Vec3(x, y, Math.sin(x) * Math.cos(y));
    },
    { slicesU: 32, slicesV: 32 },
  ),
  new Material({ fill: '#c9cfdb', side: 'double' }),
);
```

## How it works

```
math → scene / geometry → compile() → DisplayList → CanvasRenderer | SVGRenderer | toSVGString
```

Geometry never draws itself. `compile()` is a pure function. It turns a scene and a
camera into a list of 2D primitives (`polygon`, `polyline`, `circle`) with resolved
CSS colors, sorted back to front. Renderers only translate this list, which is why
Canvas and SVG produce the same image. A new output format only needs a
`draw(list)` method.

Conventions: right-handed coordinate system, +Y up, and cameras look down −Z.
Front faces are counter-clockwise. Angles are in radians, except
`PerspectiveCamera.fov`, which is in degrees. Vector and matrix methods mutate
`this`, so call `.clone()` first if you need to keep the original.

## Bundles

| File                  | Format             | Use                                                     |
| --------------------- | ------------------ | ------------------------------------------------------- |
| `dist/geo.js`         | ESM, readable      | Bundlers (`import … from '@janwalenda/geo'`)            |
| `dist/geo.cjs`        | CommonJS, readable | Node (`require('@janwalenda/geo')`)                     |
| `dist/geo.min.js`     | ESM, minified      | Browser `<script type="module">`, `@janwalenda/geo/min` |
| `dist/geo.umd.min.js` | UMD, minified      | Browser `<script>`, CDN, global `Geo`                   |
| `dist/geo.d.ts`       | TypeScript types   | Bundled declarations (`geo.d.cts` for `require`)        |

```html
<script src="https://unpkg.com/@janwalenda/geo/dist/geo.umd.min.js"></script>
<script>
  const { Scene, CanvasRenderer } = window.Geo;
</script>
```

## Development

```bash
npm install
npm run dev         # demo: same scene in Canvas and SVG side by side
npm run typecheck
npm test            # Vitest (npm run test:watch for watch mode)
npm run build       # Rollup → dist/
npm run test:dist   # smoke-test every built entry point
```

This repository uses **Git Flow** (`feature/*`, `bugfix/*`, `release/*`, `hotfix/*`).
The rules for people and for AI agents live in
[`.cursor/rules/`](.cursor/rules/). Cursor reads them directly, and Claude Code
reads them through [`CLAUDE.md`](CLAUDE.md).

## License

MIT © Jan Walenda

# geo.js

A math-based 2D/3D engine that renders the same scene to **Canvas 2D** and **SVG**.

## Installation

```bash
npm install @janwalenda/geo
```

## Bundles

| File                   | Format                 | Use                                   |
|------------------------|------------------------|---------------------------------------|
| `dist/geo.js`          | ESM, readable          | Bundlers (`import … from '@janwalenda/geo'`) |
| `dist/geo.cjs`         | CommonJS, readable     | Node (`require('@janwalenda/geo')`)   |
| `dist/geo.min.js`      | ESM, minified          | Browser `<script type="module">`, `@janwalenda/geo/min` |
| `dist/geo.umd.min.js`  | UMD, minified          | Browser `<script>`, CDN, global `Geo` |
| `dist/geo.d.ts`        | TypeScript types       | bundled declarations                  |

```html
<!-- classic script tag, exposes window.Geo -->
<script src="https://unpkg.com/@janwalenda/geo/dist/geo.umd.min.js"></script>

<!-- native ES module -->
<script type="module">
  import * as Geo from 'https://unpkg.com/@janwalenda/geo/dist/geo.min.js';
</script>
```

## Development

```bash
npm install
npm run dev         # demo with hot reload
npm run typecheck
npm run build       # all bundles into dist/
npm run test:dist   # smoke-test the built bundles
```

This repository uses **Git Flow** – see [`.cursor/rules/git-flow.mdc`](.cursor/rules/git-flow.mdc).

## License

MIT © Jan Walenda

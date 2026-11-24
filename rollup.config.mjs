import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

/**
 * Library build.
 *
 *   dist/geo.js          ESM, readable, tree-shakeable   (bundlers: `import`)
 *   dist/geo.cjs         CommonJS, readable              (Node: `require`)
 *   dist/geo.min.js      ESM, minified                   (browser: <script
 *   type="module">) dist/geo.umd.min.js  UMD, minified, global `Geo`
 *   (browser: <script>, CDN) dist/geo.d.ts        bundled type declarations (+
 *   geo.d.cts for require)
 *
 * The demo (index.html, demo/) is served by Vite: `npm run dev`.
 */

const input = 'src/index.ts';
const banner =
  '/*! @janwalenda/geo | MIT License | github.com/janwalenda/geo.js */';
const min = terser({ format: { comments: /^!/ } });

export default [
  {
    input,
    plugins: [esbuild({ target: 'es2022' })],
    output: [
      { file: 'dist/geo.js', format: 'es', sourcemap: true, banner },
      {
        file: 'dist/geo.cjs',
        format: 'cjs',
        sourcemap: true,
        banner,
        exports: 'named',
      },
      {
        file: 'dist/geo.min.js',
        format: 'es',
        sourcemap: true,
        banner,
        plugins: [min],
      },
      {
        file: 'dist/geo.umd.min.js',
        format: 'umd',
        name: 'Geo',
        sourcemap: true,
        banner,
        exports: 'named',
        plugins: [min],
      },
    ],
  },
  {
    input,
    plugins: [dts()],
    output: [
      { file: 'dist/geo.d.ts', format: 'es' },
      { file: 'dist/geo.d.cts', format: 'es' },
    ],
  },
];

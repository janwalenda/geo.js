// Smoke test for the published package: every entry point must load and
// expose the same public API. Run after `npm run build`.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const expected = ['Vec3', 'Mat4', 'Quat', 'Scene', 'Mesh', 'BoxGeometry', 'PerspectiveCamera', 'compile', 'CanvasRenderer', 'SVGRenderer', 'toSVGString', 'Circle'];

function check(name, mod) {
    const missing = expected.filter((key) => !(key in mod));
    if (missing.length) throw new Error(`${name}: missing exports ${missing.join(', ')}`);
    // Render a cube to an SVG string: exercises math, scene, pipeline and serializer without a DOM.
    const scene = new mod.Scene().add(new mod.Mesh(new mod.BoxGeometry()));
    const camera = new mod.PerspectiveCamera();
    camera.position.set(2, 2, 3);
    camera.lookAt(new mod.Vec3());
    const svg = mod.toSVGString(mod.compile(scene, camera, { width: 100, height: 100 }));
    const faces = svg.match(/<polygon /g)?.length;
    if (faces !== 3) throw new Error(`${name}: expected 3 visible cube faces, got ${faces}`);
    console.log(`ok  ${name} (${Object.keys(mod).length} exports)`);
}

check('import  @janwalenda/geo', await import('@janwalenda/geo'));
check('require @janwalenda/geo', require('@janwalenda/geo'));
check('import  @janwalenda/geo/min', await import('@janwalenda/geo/min'));

const umd = { self: {} };
vm.runInNewContext(readFileSync(new URL('../dist/geo.umd.min.js', import.meta.url), 'utf8'), umd);
check('UMD     window.Geo', umd.self.Geo ?? umd.Geo);

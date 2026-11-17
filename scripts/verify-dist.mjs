// Smoke test for the published package: every entry point must load and
// expose the same public API. Run after `npm run build`.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const expected = ['Vector3', 'Matrix3', 'Screen', 'Group', 'Circle', 'Cube', 'ScreenType', 'project'];

function check(name, mod) {
    const missing = expected.filter((key) => !(key in mod));
    if (missing.length) throw new Error(`${name}: missing exports ${missing.join(', ')}`);
    const v = new mod.Vector3(3, 4, 0);
    if (v.mag() !== 5) throw new Error(`${name}: Vector3.mag() is broken`);
    console.log(`ok  ${name} (${Object.keys(mod).length} exports)`);
}

check('import  @janwalenda/geo', await import('@janwalenda/geo'));
check('require @janwalenda/geo', require('@janwalenda/geo'));
check('import  @janwalenda/geo/min', await import('@janwalenda/geo/min'));

const umd = { self: {} };
vm.runInNewContext(readFileSync(new URL('../dist/geo.umd.min.js', import.meta.url), 'utf8'), umd);
check('UMD     window.Geo', umd.self.Geo ?? umd.Geo);

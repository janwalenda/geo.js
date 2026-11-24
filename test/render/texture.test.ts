import { describe, expect, it } from 'vitest';
import { BoxGeometry, Geometry, PlaneGeometry } from '../../src/geometry';
import { Vec3 } from '../../src/math';
import { compile, projectPoint } from '../../src/render/compile';
import type { ImagePrimitive, PolygonPrimitive } from '../../src/render/DisplayList';
import { AmbientLight, DirectionalLight, Material, Mesh, PerspectiveCamera, Scene, Texture } from '../../src/scene';
import { expectArray } from '../helpers';

const W = 200;
const H = 100;

function camera(z = 5): PerspectiveCamera {
    const cam = new PerspectiveCamera({ fov: 60 });
    cam.position.set(0, 0, z);
    return cam;
}

function apply(m: number[], u: number, v: number): [number, number] {
    return [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]];
}

const images = (scene: Scene, cam = camera(), seams = 0) =>
    compile(scene, cam, { width: W, height: H, seams }).primitives.filter((p): p is ImagePrimitive => p.type === 'image');

describe('compile with textures', () => {
    it('maps the texture corners onto the projected corners of a facing plane', () => {
        const scene = new Scene().add(new Mesh(new PlaneGeometry(2, 2), new Material({ map: 'tex.png', textureDetail: 1 })));
        const pieces = images(scene);
        expect(pieces).toHaveLength(2); // one quad → two triangles
        expect(pieces.every((p) => p.src === 'tex.png' && p.opacity === 1)).toBe(true);
        const corner = (x: number, y: number) => {
            const p = projectPoint(new Vec3(x, y, 0), camera(), W, H);
            return p ? [p.x, p.y] : [];
        };
        // Texture (0, 0) is the image's top-left = the plane's (−1, +1) corner.
        for (const piece of pieces) {
            expectArray(apply(piece.transform, 0, 0), corner(-1, 1), 4);
            expectArray(apply(piece.transform, 1, 1), corner(1, -1), 4);
        }
    });

    it('subdivides into n² triangles per triangle for textureDetail n', () => {
        const scene = new Scene().add(new Mesh(new PlaneGeometry(2, 2), new Material({ map: 'tex.png', textureDetail: 3 })));
        expect(images(scene)).toHaveLength(2 * 9);
    });

    it("'auto' keeps one piece head-on and subdivides steep, near faces", () => {
        const flat = new Scene().add(new Mesh(new PlaneGeometry(2, 2), new Material({ map: 'tex.png' })));
        expect(images(flat)).toHaveLength(2);
        const floor = new Mesh(new PlaneGeometry(6, 6), new Material({ map: 'tex.png' }));
        floor.rotation.setFromEuler(-Math.PI / 2, 0, 0);
        floor.position.y = -1;
        expect(images(new Scene().add(floor)).length).toBeGreaterThan(2);
    });

    it('interpolates UVs when clipping at the near plane', () => {
        const floor = new Mesh(new PlaneGeometry(4, 20), new Material({ map: 'tex.png', textureDetail: 1 }));
        floor.rotation.setFromEuler(-Math.PI / 2, 0, 0);
        floor.position.y = -1;
        const pieces = images(new Scene().add(floor), camera(0));
        expect(pieces.length).toBeGreaterThan(0);
        for (const p of pieces) expect(p.transform.every(Number.isFinite)).toBe(true);
    });

    it('darkens lit textured faces with a black overlay and keeps it after its pieces', () => {
        const scene = new Scene().add(
            new AmbientLight('#ffffff', 0.25),
            new Mesh(new PlaneGeometry(2, 2), new Material({ map: new Texture('tex.png'), textureDetail: 1 })),
        );
        const sun = new DirectionalLight('#ffffff', 0.5);
        sun.position.set(0, 0, 1);
        scene.add(sun);
        const list = compile(scene, camera(), { width: W, height: H });
        expect(list.primitives.map((p) => p.type)).toEqual(['image', 'image', 'polygon']);
        const overlay = list.primitives[2] as PolygonPrimitive;
        expect(overlay.fill).toBe('#000000');
        expect(overlay.opacity).toBeCloseTo(0.25);
    });

    it('adds no overlay for unlit materials or fully lit faces', () => {
        const scene = new Scene().add(new Mesh(new PlaneGeometry(2, 2), new Material({ map: 'tex.png', lit: false })));
        scene.add(new AmbientLight('#ffffff', 0.2));
        expect(compile(scene, camera(), { width: W, height: H }).primitives.every((p) => p.type === 'image')).toBe(true);
    });

    it('falls back to flat fills for geometries without UVs and for wireframes', () => {
        const noUV = new Scene().add(new Mesh(new Geometry([new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(0, 1, 0)], [[0, 1, 2]]), new Material({ map: 'tex.png' })));
        expect(compile(noUV, camera(), { width: W, height: H }).primitives.map((p) => p.type)).toEqual(['polygon']);
        const wire = new Scene().add(new Mesh(new BoxGeometry(), new Material({ map: 'tex.png', wireframe: true })));
        expect(images(wire)).toHaveLength(0);
    });

    it('draws a material stroke on top of the texture', () => {
        const scene = new Scene().add(new Mesh(new PlaneGeometry(2, 2), new Material({ map: 'tex.png', stroke: 'red', textureDetail: 1 })));
        const list = compile(scene, camera(), { width: W, height: H });
        expect(list.primitives.at(-1)).toMatchObject({ type: 'polygon', fill: null, stroke: '#ff0000' });
    });
});

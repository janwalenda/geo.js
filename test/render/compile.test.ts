import { describe, expect, it } from 'vitest';
import { BoxGeometry, Geometry, PlaneGeometry } from '../../src/geometry';
import { Vec3 } from '../../src/math';
import {
    AmbientLight, type Camera, DirectionalLight, Material, Mesh, OrthographicCamera, PerspectiveCamera, Points, Polyline, Scene,
} from '../../src/scene';
import { compile, projectPoint } from '../../src/render/compile';
import type { PolygonPrimitive } from '../../src/render/DisplayList';

const W = 200;
const H = 100;

function camera(z = 5): PerspectiveCamera {
    const cam = new PerspectiveCamera({ fov: 60 });
    cam.position.set(0, 0, z);
    return cam;
}

function polygons(scene: Scene, cam: Camera = camera(), seams = 0): PolygonPrimitive[] {
    return compile(scene, cam, { width: W, height: H, seams }).primitives.filter(
        (p): p is PolygonPrimitive => p.type === 'polygon',
    );
}

describe('compile', () => {
    it('maps the world origin to the viewport center', () => {
        const p = projectPoint(new Vec3(), camera(), W, H);
        expect(p?.x).toBeCloseTo(W / 2);
        expect(p?.y).toBeCloseTo(H / 2);
        expect(projectPoint(new Vec3(0, 0, 10), camera(), W, H)).toBeNull();
    });

    it('flips y: world +Y is up on screen', () => {
        const p = projectPoint(new Vec3(0, 1, 0), camera(), W, H);
        expect(p!.y).toBeLessThan(H / 2);
    });

    it('culls back faces: a cube seen head-on shows exactly one face', () => {
        const scene = new Scene().add(new Mesh(new BoxGeometry()));
        expect(polygons(scene)).toHaveLength(1);
    });

    it('a rotated cube shows three faces; double-sided shows all six', () => {
        const mesh = new Mesh(new BoxGeometry());
        mesh.rotateX(0.5).rotateY(0.6);
        const scene = new Scene().add(mesh);
        expect(polygons(scene)).toHaveLength(3);
        mesh.material.side = 'double';
        expect(polygons(scene)).toHaveLength(6);
        mesh.material.side = 'back';
        expect(polygons(scene)).toHaveLength(3);
    });

    it('sorts back to front (painter’s algorithm)', () => {
        const near = new Mesh(new PlaneGeometry(), new Material({ fill: '#ff0000', lit: false }));
        const far = new Mesh(new PlaneGeometry(), new Material({ fill: '#0000ff', lit: false }));
        far.position.z = -3;
        const result = polygons(new Scene().add(near, far));
        expect(result.map((p) => p.fill)).toEqual(['#0000ff', '#ff0000']);
        expect(result[0].depth).toBeGreaterThan(result[1].depth);
    });

    it('draws a large floor face before an object standing on it, even if its center is nearer', () => {
        // The floor's center is ~6.4 from the camera, the box ~8.7: sorting by center
        // distance alone would paint the floor over the whole box.
        const floor = new Mesh(new PlaneGeometry(12, 12), new Material({ fill: '#00ff00', lit: false }));
        floor.rotateX(-Math.PI / 2);
        const box = new Mesh(new BoxGeometry(), new Material({ fill: '#ff0000', lit: false }));
        box.position.set(0, 0.5, -3);
        const cam = new PerspectiveCamera({ fov: 60 });
        cam.position.set(0, 4, 5);
        cam.lookAt(new Vec3(0, 0, -1));
        const fills = polygons(new Scene().add(box, floor), cam).map((p) => p.fill);
        expect(fills.filter((f) => f === '#ff0000')).toHaveLength(2);
        expect(fills[0]).toBe('#00ff00');
    });

    it('keeps plain depth order for faces whose screen areas do not overlap', () => {
        const left = new Mesh(new PlaneGeometry(), new Material({ fill: '#ff0000', lit: false }));
        const right = new Mesh(new PlaneGeometry(), new Material({ fill: '#0000ff', lit: false }));
        left.position.set(-1.5, 0, -2);
        right.position.set(1.5, 0, 0);
        expect(polygons(new Scene().add(right, left)).map((p) => p.fill)).toEqual(['#ff0000', '#0000ff']);
    });

    it('clips polygons at the near plane instead of projecting through the camera', () => {
        // A floor stretching from far in front of the camera to far behind it.
        const floor = new Mesh(new PlaneGeometry(10, 40));
        floor.rotateX(-Math.PI / 2);
        floor.position.y = -1;
        const result = polygons(new Scene().add(floor), camera(0));
        expect(result).toHaveLength(1);
        const ys = result[0].points.filter((_, i) => i % 2 === 1);
        expect(ys.every(Number.isFinite)).toBe(true);
        expect(Math.max(...ys)).toBeGreaterThan(H); // reaches below the screen bottom
    });

    it('drops geometry completely behind the camera or beyond the far plane', () => {
        const behind = new Mesh(new BoxGeometry());
        behind.position.z = 10;
        const beyond = new Mesh(new BoxGeometry());
        beyond.position.z = -5000;
        expect(polygons(new Scene().add(behind, beyond))).toHaveLength(0);
    });

    it('shades with ambient and directional light (Lambert)', () => {
        const mesh = new Mesh(new PlaneGeometry(), new Material({ fill: '#ffffff' }));
        const sun = new DirectionalLight('#ffffff', 0.5);
        sun.position.set(0, 0, 1);
        const scene = new Scene().add(mesh, new AmbientLight('#ffffff', 0.25), sun);
        expect(polygons(scene)[0].fill).toBe('#bfbfbf'); // 0.75 · 255

        sun.position.set(0, 0, -1); // light from behind the plane
        expect(polygons(scene)[0].fill).toBe('#404040'); // ambient only
    });

    it('leaves colors untouched when the scene has no lights or the material is unlit', () => {
        const mesh = new Mesh(new PlaneGeometry(), new Material({ fill: '#336699' }));
        expect(polygons(new Scene().add(mesh))[0].fill).toBe('#336699');
        mesh.material.lit = false;
        expect(polygons(new Scene().add(mesh, new AmbientLight()))[0].fill).toBe('#336699');
    });

    it('adds a seam-hiding hairline only to opaque faces without stroke', () => {
        const mesh = new Mesh(new PlaneGeometry(), new Material({ fill: '#123456', lit: false }));
        const scene = new Scene().add(mesh);
        expect(polygons(scene, camera(), 0.5)[0]).toMatchObject({ stroke: '#123456', lineWidth: 0.5 });
        mesh.material.opacity = 0.5;
        expect(polygons(scene, camera(), 0.5)[0].stroke).toBeNull();
    });

    it('wireframe materials only stroke', () => {
        const mesh = new Mesh(new BoxGeometry(), new Material({ wireframe: true, stroke: '#ff0000', lineWidth: 2 }));
        expect(polygons(new Scene().add(mesh))[0]).toMatchObject({ fill: null, stroke: '#ff0000', lineWidth: 2 });
    });

    it('works with an orthographic camera', () => {
        const cam = new OrthographicCamera({ size: 1 });
        cam.position.set(0, 0, 5);
        const result = polygons(new Scene().add(new Mesh(new PlaneGeometry(2, 2))), cam);
        expect(result).toHaveLength(1);
        const xs = result[0].points.filter((_, i) => i % 2 === 0);
        // size 1 → half height 1 world unit = 50 px, aspect 2 → half width 2 units = 100 px
        expect(Math.min(...xs)).toBeCloseTo(W / 2 - 50);
        expect(Math.max(...xs)).toBeCloseTo(W / 2 + 50);
    });

    it('emits polylines, splitting them where they cross the near plane', () => {
        const line = new Polyline([new Vec3(-1, 0, 0), new Vec3(1, 0, 0), new Vec3(1, 0, 20), new Vec3(1, 1, 0)]);
        const result = compile(new Scene().add(line), camera(), { width: W, height: H }).primitives;
        expect(result.map((p) => p.type)).toEqual(['polyline', 'polyline']);

        const loop = new Polyline([new Vec3(-1, -1, 0), new Vec3(1, -1, 0), new Vec3(0, 1, 0)], undefined, true);
        const [closed] = compile(new Scene().add(loop), camera(), { width: W, height: H }).primitives;
        expect(closed).toMatchObject({ type: 'polyline', closed: true });
        expect(closed.type === 'polyline' && closed.points).toHaveLength(6);
    });

    it('emits points as circles with the material size', () => {
        const cloud = new Points([new Vec3(0, 0, 0), new Vec3(0, 0, 100)], new Material({ fill: 'red', pointSize: 4 }));
        const result = compile(new Scene().add(cloud), camera(), { width: W, height: H }).primitives;
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ type: 'circle', radius: 4, fill: '#ff0000' });
    });

    it('skips degenerate faces and hidden objects, and reports the background', () => {
        const degenerate = new Geometry([new Vec3(), new Vec3(1, 0, 0), new Vec3(2, 0, 0)], [[0, 1, 2]]);
        const hidden = new Mesh(new BoxGeometry());
        hidden.visible = false;
        const scene = new Scene({ background: '#fafafa' }).add(new Mesh(degenerate), hidden);
        const list = compile(scene, camera(), { width: W, height: H });
        expect(list.primitives).toHaveLength(0);
        expect(list.background).toBe('#fafafa');
    });
});

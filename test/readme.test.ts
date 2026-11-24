// @vitest-environment jsdom
// Keeps the examples in README.md honest: they must run against the real API.
// jsdom only for the export example; the other examples do not touch the DOM.
import { describe, expect, it, vi } from 'vitest';
import {
    AmbientLight, BoxGeometry, CanvasRenderer, Circle, DirectionalLight, FunctionGraph, IcosahedronGeometry, Material, Mesh,
    ParametricGeometry, PerspectiveCamera, SVGRenderer, Scene, Vec3, compile, toSVGString,
} from '../src';

describe('README examples', () => {
    it('server-side rendering produces an SVG document', () => {
        const scene = new Scene().add(new Mesh(new BoxGeometry()));
        const camera = new PerspectiveCamera();
        camera.position.set(2, 2, 3);
        camera.lookAt(new Vec3());
        const svg = toSVGString(compile(scene, camera, { width: 400, height: 300 }));
        expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
        expect(svg.match(/<polygon /g)).toHaveLength(3);
    });

    it('quick-start scene compiles with lighting', () => {
        const scene = new Scene({ background: '#ffffff' });
        const ball = new Mesh(new IcosahedronGeometry(1, 2), new Material({ fill: '#4f7cff' }));
        const sun = new DirectionalLight('#ffffff', 0.9);
        sun.position.set(3, 5, 4);
        scene.add(ball, new AmbientLight('#ffffff', 0.3), sun);
        const camera = new PerspectiveCamera({ fov: 45 });
        camera.position.set(0, 1.5, 5);
        camera.lookAt(new Vec3(0, 0, 0));
        ball.rotation.setFromEuler(0, 1, 0);
        const list = compile(scene, camera, { width: 640, height: 480 });
        expect(list.primitives.length).toBeGreaterThan(100);
        expect(new Set(list.primitives.map((p) => ('fill' in p ? p.fill : null))).size).toBeGreaterThan(10); // shaded
    });

    it('2D and surface examples build', () => {
        const shapes = [
            new FunctionGraph({ fn: Math.sin, xMin: -Math.PI, xMax: Math.PI, unit: 40, position: [150, 100], stroke: 'red' }),
            new Circle({ position: [150, 100], radius: 4, fill: 'black', stroke: null }),
        ];
        expect(shapes.flatMap((s) => s.toPrimitives())).toHaveLength(2);
        const surface = new ParametricGeometry((u, v) => {
            const x = (u - 0.5) * 6, y = (v - 0.5) * 6;
            return new Vec3(x, y, Math.sin(x) * Math.cos(y));
        }, { slicesU: 32, slicesV: 32 });
        expect(surface.faces).toHaveLength(1024);
    });

    it('download example exports SVG and PNG', async () => {
        Object.assign(URL, { createObjectURL: () => 'blob:readme', revokeObjectURL: () => {} });
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        // jsdom has no canvas implementation: stand in for the 2D context and the encoder.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
        vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AAAA');
        vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb, type) => cb(new Blob([], { type })));

        const svg = new SVGRenderer({ width: 300, height: 200 });
        svg.render2D([new Circle({ position: [150, 100], radius: 40, fill: '#4f7cff' })], '#ffffff');
        const link = document.body.appendChild(svg.createDownloadLink({ filename: 'circle.svg', text: 'Save SVG' }));
        expect(link.download).toBe('circle.svg');
        expect(decodeURIComponent(link.href)).toContain('<circle cx="150" cy="100" r="40"');
        await svg.download('circle.svg');

        const canvas = new CanvasRenderer({ width: 300, height: 200, imageType: 'image/png' });
        await canvas.download('scene.png');
        expect((await canvas.toBlob()).type).toBe('image/png');
        expect(canvas.toDataURL()).toMatch(/^data:image\/png;base64,/);
        expect(svg.toSVGString()).toMatch(/^<svg xmlns=/);
        expect(click.mock.contexts.map((a) => (a as HTMLAnchorElement).download)).toEqual(['circle.svg', 'scene.png']);
        vi.restoreAllMocks();
    });
});

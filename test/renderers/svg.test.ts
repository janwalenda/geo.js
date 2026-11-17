// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { BoxGeometry } from '../../src/geometry';
import { Vec3 } from '../../src/math';
import type { DisplayList } from '../../src/render';
import { Material, Mesh, PerspectiveCamera, Scene } from '../../src/scene';
import { SVGRenderer } from '../../src/renderers/SVGRenderer';
import { toSVGString } from '../../src/renderers/svgMarkup';

const list: DisplayList = {
    width: 100,
    height: 50,
    background: '#ffffff',
    primitives: [
        { type: 'polygon', points: [0, 0, 10.004, 0, 10, 10.556], fill: '#ff0000', stroke: null, lineWidth: 1, opacity: 1, depth: 2 },
        { type: 'polyline', points: [0, 0, 5, 5], closed: false, fill: null, stroke: '#000000', lineWidth: 2, opacity: 0.5, depth: 1 },
        { type: 'circle', x: 3, y: 4, radius: 2, fill: '#00ff00', stroke: null, lineWidth: 1, opacity: 1, depth: 0 },
    ],
};

describe('toSVGString', () => {
    it('serializes a display list without a DOM-specific API', () => {
        const svg = toSVGString(list);
        expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="100" height="50" viewBox="0 0 100 50">/);
        expect(svg).toContain('<rect x="0" y="0" width="100" height="50" fill="#ffffff"/>');
        expect(svg).toContain('<polygon points="0,0 10,0 10,10.56" fill="#ff0000" stroke="none"/>');
        expect(svg).toContain('<polyline points="0,0 5,5" fill="none" stroke="#000000" stroke-width="2"');
        expect(svg).toContain('opacity="0.5"');
        expect(svg).toContain('<circle cx="3" cy="4" r="2" fill="#00ff00" stroke="none"/>');
    });

    it('respects the precision option', () => {
        expect(toSVGString(list, { precision: 0 })).toContain('points="0,0 10,0 10,11"');
    });
});

describe('SVGRenderer', () => {
    it('produces the same markup as toSVGString', () => {
        const renderer = new SVGRenderer({ width: 100, height: 50 });
        renderer.draw(list);
        expect(new XMLSerializer().serializeToString(renderer.domElement)).toBe(toSVGString(list));
    });

    it('reuses elements between frames and removes leftovers', () => {
        const renderer = new SVGRenderer({ width: 100, height: 50 });
        renderer.draw(list);
        const first = renderer.domElement.children[1];
        renderer.draw({ ...list, primitives: [{ ...list.primitives[0], fill: '#0000ff' }] });
        expect(renderer.domElement.children).toHaveLength(2);
        expect(renderer.domElement.children[1]).toBe(first);
        expect(first.getAttribute('fill')).toBe('#0000ff');

        renderer.draw({ ...list, background: null, primitives: [] });
        expect(renderer.domElement.children).toHaveLength(0);
    });

    it('drops attributes that are no longer needed', () => {
        const renderer = new SVGRenderer();
        renderer.draw({ ...list, background: null, primitives: [list.primitives[1]] });
        const node = renderer.domElement.children[0];
        expect(node.getAttribute('opacity')).toBe('0.5');
        renderer.draw({ ...list, background: null, primitives: [{ ...list.primitives[1], opacity: 1 }] });
        expect(node.hasAttribute('opacity')).toBe(false);
    });

    it('renders a scene end to end and resizes', () => {
        const renderer = new SVGRenderer({ width: 120, height: 80 });
        const camera = new PerspectiveCamera();
        camera.position.set(2, 2, 4);
        camera.lookAt(new Vec3(0, 0, 0));
        const scene = new Scene({ background: '#eeeeee' }).add(new Mesh(new BoxGeometry(), new Material({ fill: '#3366cc' })));
        const drawn = renderer.render(scene, camera);
        expect(drawn.primitives).toHaveLength(3);
        expect(renderer.domElement.querySelectorAll('polygon')).toHaveLength(3);

        renderer.setSize(60, 40);
        expect(renderer.domElement.getAttribute('viewBox')).toBe('0 0 60 40');
    });
});

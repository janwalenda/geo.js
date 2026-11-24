// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoxGeometry } from '../../src/geometry';
import { Vec3 } from '../../src/math';
import type { DisplayList, ImagePrimitive, PolygonPrimitive } from '../../src/render';
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
        renderer.draw({ ...list, primitives: [{ ...(list.primitives[0] as PolygonPrimitive), fill: '#0000ff' }] });
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

describe('SVGRenderer export', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    const drawn = () => {
        const renderer = new SVGRenderer({ width: 100, height: 50 });
        renderer.draw(list);
        return renderer;
    };

    it('serializes the current frame like toSVGString', () => {
        const renderer = drawn();
        expect(renderer.mimeType).toBe('image/svg+xml');
        expect(renderer.fileExtension).toBe('svg');
        expect(renderer.toSVGString()).toBe(toSVGString(list));
    });

    it('encodes the SVG as a data URL that decodes back to the markup', () => {
        const url = drawn().toDataURL();
        const prefix = 'data:image/svg+xml;charset=utf-8,';
        expect(url.startsWith(prefix)).toBe(true);
        expect(url).not.toMatch(/[<>"# ]/); // safe inside href
        expect(decodeURIComponent(url.slice(prefix.length))).toBe(toSVGString(list));
    });

    it('exports a Blob with the SVG markup', async () => {
        const blob = await drawn().toBlob();
        expect(blob.type).toBe('image/svg+xml');
        expect(await blob.text()).toBe(toSVGString(list));
    });

    it('creates a download link that is a snapshot of the current frame', () => {
        const renderer = drawn();
        const link = renderer.createDownloadLink();
        expect(link.download).toBe('geo.svg');
        expect(link.type).toBe('image/svg+xml');
        expect(link.textContent).toBe('Download geo.svg');
        const href = link.href;
        renderer.draw({ ...list, primitives: [] });
        expect(link.href).toBe(href);
        expect(renderer.createDownloadLink().href).not.toBe(href);
    });

    it('downloads through a temporary object URL', async () => {
        vi.useFakeTimers();
        const blobs: Blob[] = [];
        const revoke = vi.fn();
        Object.assign(URL, { createObjectURL: (b: Blob) => (blobs.push(b), 'blob:geo-svg'), revokeObjectURL: revoke });
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        await drawn().download('cube.svg');
        expect(click).toHaveBeenCalledTimes(1);
        const link = click.mock.contexts[0] as HTMLAnchorElement;
        expect(link.download).toBe('cube.svg');
        expect(await blobs[0].text()).toBe(toSVGString(list));
        vi.runAllTimers();
        expect(revoke).toHaveBeenCalledWith('blob:geo-svg');
    });
});

describe('textures in SVG', () => {
    const image: ImagePrimitive = {
        type: 'image', src: 'tex.png', transform: [100, 0, 0, 50, 5, 7], points: [5, 7, 105, 7, 5, 57], opacity: 0.5, depth: 1,
    };
    const textured: DisplayList = { width: 100, height: 50, background: null, primitives: [image, { ...image }] };

    it('serializes one shared <image> per texture and a clipped <use> per piece', () => {
        const svg = toSVGString(textured);
        expect(svg.match(/<image /g)).toHaveLength(1);
        expect(svg).toContain('<defs><image id="geo-tex-0" href="tex.png" width="1" height="1" preserveAspectRatio="none"/></defs>');
        expect(svg).toContain('<clipPath id="geo-clip-0"><polygon points="5,7 105,7 5,57"/></clipPath>');
        expect(svg).toContain('<g clip-path="url(#geo-clip-0)" opacity="0.5"><use href="#geo-tex-0" transform="matrix(100 0 0 50 5 7)"/></g>');
        expect(svg).toContain('geo-clip-1');
    });

    it('omits <defs> when nothing is textured', () => {
        expect(toSVGString(list)).not.toContain('<defs');
    });

    it('creates <defs> lazily in the DOM renderer, with ids unique per renderer, and reuses pieces', () => {
        const a = new SVGRenderer({ width: 100, height: 50 });
        const b = new SVGRenderer({ width: 100, height: 50 });
        a.draw(list);
        expect(a.domElement.querySelector('defs')).toBeNull();
        a.draw(textured);
        b.draw(textured);
        const defs = a.domElement.firstElementChild;
        expect(defs?.tagName).toBe('defs');
        expect(defs?.children).toHaveLength(1);
        const idA = a.domElement.querySelector('image')?.id;
        expect(idA).toBeTruthy();
        expect(idA).not.toBe(b.domElement.querySelector('image')?.id);

        const piece = a.domElement.children[1];
        const use = piece.querySelector('use');
        a.draw({ ...textured, primitives: [{ ...image, transform: [50, 0, 0, 50, 0, 0] }] });
        expect(a.domElement.children[1]).toBe(piece);
        expect(piece.querySelector('use')).toBe(use);
        expect(use?.getAttribute('transform')).toBe('matrix(50 0 0 50 0 0)');
        expect(use?.getAttribute('href')).toBe(`#${idA}`);
        expect(a.domElement.children).toHaveLength(2); // defs + one piece
    });
});

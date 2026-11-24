import type { DisplayList, ImagePrimitive, Primitive, ShapePrimitive } from '../render/DisplayList';

export const SVG_NS = 'http://www.w3.org/2000/svg';

export type SVGTag = 'polygon' | 'polyline' | 'circle' | 'rect';

/** Format a number with at most `precision` decimals and no trailing zeros. */
export function formatNumber(value: number, precision: number): string {
    const s = String(+value.toFixed(precision));
    return s === '-0' ? '0' : s;
}

function formatPoints(points: number[], precision: number): string {
    const parts: string[] = [];
    for (let i = 0; i < points.length; i += 2) {
        parts.push(`${formatNumber(points[i], precision)},${formatNumber(points[i + 1], precision)}`);
    }
    return parts.join(' ');
}

export function tagFor(p: ShapePrimitive): SVGTag {
    if (p.type === 'polyline') return p.closed ? 'polygon' : 'polyline';
    return p.type;
}

/**
 * SVG attributes of a primitive. Shared by the DOM renderer and the string
 * serializer so both produce identical markup.
 */
export function attributesFor(p: ShapePrimitive, precision: number): Record<string, string> {
    const attrs: Record<string, string> = {};
    if (p.type === 'circle') {
        attrs.cx = formatNumber(p.x, precision);
        attrs.cy = formatNumber(p.y, precision);
        attrs.r = formatNumber(p.radius, precision);
    } else {
        attrs.points = formatPoints(p.points, precision);
    }
    attrs.fill = p.type === 'polyline' ? 'none' : p.fill ?? 'none';
    attrs.stroke = p.stroke ?? 'none';
    if (p.stroke) {
        attrs['stroke-width'] = formatNumber(p.lineWidth, precision);
        attrs['stroke-linejoin'] = 'round';
        attrs['stroke-linecap'] = 'round';
    }
    if (p.opacity < 1) attrs.opacity = formatNumber(p.opacity, 3);
    return attrs;
}

/** Element tree: what a primitive becomes in SVG. Shared by the DOM renderer and the serializer. */
export interface SVGNode {
    tag: string;
    attrs: Record<string, string>;
    children?: SVGNode[];
}

/** Document-unique ids for clip paths and shared texture images. */
export interface SVGIds {
    clip(index: number): string;
    texture(src: string): string;
}

/** SVG for primitive number `index` of a display list. */
export function nodeFor(p: Primitive, index: number, precision: number, ids: SVGIds): SVGNode {
    return p.type === 'image' ? imageNode(p, index, precision, ids) : { tag: tagFor(p), attrs: attributesFor(p, precision) };
}

/**
 * A texture piece: `<g><clipPath id><polygon/></clipPath><g clip-path><use transform/></g></g>`.
 * The clip polygon is in screen space (the clipped `<g>` has no transform); the `<use>`
 * places the shared 1 × 1 texture image with the piece's affine matrix.
 */
function imageNode(p: ImagePrimitive, index: number, precision: number, ids: SVGIds): SVGNode {
    const clip = ids.clip(index);
    const matrix = p.transform.map((v, i) => formatNumber(v, i < 4 ? precision + 2 : precision)).join(' ');
    const inner: Record<string, string> = { 'clip-path': `url(#${clip})` };
    if (p.opacity < 1) inner.opacity = formatNumber(p.opacity, 3);
    return {
        tag: 'g',
        attrs: {},
        children: [
            { tag: 'clipPath', attrs: { id: clip }, children: [{ tag: 'polygon', attrs: { points: formatPoints(p.points, precision) } }] },
            { tag: 'g', attrs: inner, children: [{ tag: 'use', attrs: { href: `#${ids.texture(p.src)}`, transform: `matrix(${matrix})` } }] },
        ],
    };
}

/** Shared texture image in `<defs>`: the unit square in texture space, stretched to fit. */
export function textureNode(id: string, src: string): SVGNode {
    return { tag: 'image', attrs: { id, href: src, width: '1', height: '1', preserveAspectRatio: 'none' } };
}

export function backgroundAttributes(list: DisplayList): Record<string, string> {
    return { x: '0', y: '0', width: String(list.width), height: String(list.height), fill: list.background ?? 'none' };
}

function escapeAttribute(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function element(tag: string, attrs: Record<string, string>, children: string[] = []): string {
    const serialized = Object.entries(attrs).map(([k, v]) => ` ${k}="${escapeAttribute(v)}"`).join('');
    return children.length ? `<${tag}${serialized}>${children.join('')}</${tag}>` : `<${tag}${serialized}/>`;
}

function serialize(node: SVGNode): string {
    return element(node.tag, node.attrs, node.children?.map(serialize));
}

export interface SVGStringOptions {
    /** Decimal places for coordinates. Default `2`. */
    precision?: number;
}

/**
 * Serialize a display list to a standalone SVG document string.
 * Works without a DOM (Node, workers) – e.g. for server-side rendering or export.
 */
export function toSVGString(list: DisplayList, options: SVGStringOptions = {}): string {
    const precision = options.precision ?? 2;
    const { width, height } = list;
    const body: string[] = [];
    const textures = new Map<string, string>();
    const ids: SVGIds = {
        clip: (index) => `geo-clip-${index}`,
        texture: (src) => {
            let id = textures.get(src);
            if (!id) textures.set(src, (id = `geo-tex-${textures.size}`));
            return id;
        },
    };
    if (list.background) body.push(element('rect', backgroundAttributes(list)));
    list.primitives.forEach((p, i) => body.push(serialize(nodeFor(p, i, precision, ids))));
    if (textures.size) {
        const defs = [...textures].map(([src, id]) => serialize(textureNode(id, src)));
        body.unshift(element('defs', {}, defs));
    }
    return (
        `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        body.join('') +
        '</svg>'
    );
}

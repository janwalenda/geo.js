import type { DisplayList, Primitive } from '../render/DisplayList';

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

export function tagFor(p: Primitive): SVGTag {
    if (p.type === 'polyline') return p.closed ? 'polygon' : 'polyline';
    return p.type;
}

/**
 * SVG attributes of a primitive. Shared by the DOM renderer and the string
 * serializer so both produce identical markup.
 */
export function attributesFor(p: Primitive, precision: number): Record<string, string> {
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

export function backgroundAttributes(list: DisplayList): Record<string, string> {
    return { x: '0', y: '0', width: String(list.width), height: String(list.height), fill: list.background ?? 'none' };
}

function escapeAttribute(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function element(tag: string, attrs: Record<string, string>): string {
    const serialized = Object.entries(attrs).map(([k, v]) => ` ${k}="${escapeAttribute(v)}"`).join('');
    return `<${tag}${serialized}/>`;
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
    if (list.background) body.push(element('rect', backgroundAttributes(list)));
    for (const p of list.primitives) body.push(element(tagFor(p), attributesFor(p, precision)));
    return (
        `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        body.join('') +
        '</svg>'
    );
}

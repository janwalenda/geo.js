import type {
  DisplayList,
  ImagePrimitive,
  Primitive,
  ShapePrimitive,
} from '../render/types';
import type { SVGIds, SVGNode, SVGStringOptions, SVGTag } from './types';

/** Namespace of SVG elements. */
export const SVG_NS = 'http://www.w3.org/2000/svg';

/** Format a number with at most `precision` decimals and no trailing zeros. */
export function formatNumber(value: number, precision: number): string {
  const s = String(Number(value.toFixed(precision)));
  return s === '-0' ? '0' : s;
}

/** Flat points as an SVG `points` attribute: `x0,y0 x1,y1 …`. */
function formatPoints(points: number[], precision: number): string {
  const parts: string[] = [];
  for (let i = 0; i < points.length; i += 2) {
    const x = formatNumber(points[i], precision);
    const y = formatNumber(points[i + 1], precision);
    parts.push(`${x},${y}`);
  }
  return parts.join(' ');
}

/** The SVG element a shape primitive becomes. */
export function tagFor(p: ShapePrimitive): SVGTag {
  if (p.type === 'polyline') {
    return p.closed ? 'polygon' : 'polyline';
  }
  return p.type;
}

/**
 * SVG attributes of a primitive. Shared by the DOM renderer and the string
 * serializer so both produce identical markup.
 */
export function attributesFor(
  p: ShapePrimitive,
  precision: number,
): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (p.type === 'circle') {
    attrs.cx = formatNumber(p.x, precision);
    attrs.cy = formatNumber(p.y, precision);
    attrs.r = formatNumber(p.radius, precision);
  } else {
    attrs.points = formatPoints(p.points, precision);
  }
  attrs.fill = p.type === 'polyline' ? 'none' : (p.fill ?? 'none');
  attrs.stroke = p.stroke ?? 'none';
  if (p.stroke) {
    attrs['stroke-width'] = formatNumber(p.lineWidth, precision);
    attrs['stroke-linejoin'] = 'round';
    attrs['stroke-linecap'] = 'round';
  }
  if (p.opacity < 1) {
    attrs.opacity = formatNumber(p.opacity, 3);
  }
  return attrs;
}

/** SVG for primitive number `index` of a display list. */
export function nodeFor(
  p: Primitive,
  index: number,
  precision: number,
  ids: SVGIds,
): SVGNode {
  return p.type === 'image'
    ? imageNode(p, index, precision, ids)
    : { tag: tagFor(p), attrs: attributesFor(p, precision) };
}

/**
 * A texture piece: `<g><clipPath id><polygon/></clipPath><g clip-path><use
 * transform/></g></g>`. The clip polygon is in screen space (the clipped `<g>`
 * has no transform); the `<use>` places the shared 1 × 1 texture image with the
 * piece's affine matrix.
 */
function imageNode(
  p: ImagePrimitive,
  index: number,
  precision: number,
  ids: SVGIds,
): SVGNode {
  const clip = ids.clip(index);
  const matrix = p.transform
    .map((v, i) => formatNumber(v, i < 4 ? precision + 2 : precision))
    .join(' ');
  const inner: Record<string, string> = { 'clip-path': `url(#${clip})` };
  if (p.opacity < 1) {
    inner.opacity = formatNumber(p.opacity, 3);
  }
  return {
    tag: 'g',
    attrs: {},
    children: [
      {
        tag: 'clipPath',
        attrs: { id: clip },
        children: [
          {
            tag: 'polygon',
            attrs: { points: formatPoints(p.points, precision) },
          },
        ],
      },
      {
        tag: 'g',
        attrs: inner,
        children: [
          {
            tag: 'use',
            attrs: {
              href: `#${ids.texture(p.src)}`,
              transform: `matrix(${matrix})`,
            },
          },
        ],
      },
    ],
  };
}

/**
 * Shared texture image in `<defs>`: the unit square in texture space, stretched
 * to fit.
 */
export function textureNode(id: string, src: string): SVGNode {
  return {
    tag: 'image',
    attrs: {
      id,
      href: src,
      width: '1',
      height: '1',
      preserveAspectRatio: 'none',
    },
  };
}

/** Attributes of the `<rect>` that paints the background of `list`. */
export function backgroundAttributes(
  list: DisplayList,
): Record<string, string> {
  return {
    x: '0',
    y: '0',
    width: String(list.width),
    height: String(list.height),
    fill: list.background ?? 'none',
  };
}

/** Escape a value for a double-quoted XML attribute. */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

/** Markup of one element with its (already serialized) children. */
function element(
  tag: string,
  attrs: Record<string, string>,
  children: string[] = [],
): string {
  const serialized = serializeAttributes(attrs);
  return children.length > 0
    ? `<${tag}${serialized}>${children.join('')}</${tag}>`
    : `<${tag}${serialized}/>`;
}

/** Attributes as ` name="value"` pairs (with a leading space each). */
function serializeAttributes(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeAttribute(v)}"`)
    .join('');
}

/** Markup of an element tree. */
function serialize(node: SVGNode): string {
  return element(node.tag, node.attrs, node.children?.map(serialize));
}

/**
 * Serialize a display list to a standalone SVG document string.
 * Works without a DOM (Node, workers) – e.g. for server-side rendering or
 * export.
 */
export function toSVGString(
  list: DisplayList,
  options: SVGStringOptions = {},
): string {
  const precision = options.precision ?? 2;
  const { width, height } = list;
  const body: string[] = [];
  const textures = new Map<string, string>();
  const ids: SVGIds = {
    clip: (index) => `geo-clip-${index}`,
    texture: (src) => {
      let id = textures.get(src);
      if (!id) {
        textures.set(src, (id = `geo-tex-${textures.size}`));
      }
      return id;
    },
  };
  if (list.background) {
    body.push(element('rect', backgroundAttributes(list)));
  }
  list.primitives.forEach((p, i) =>
    body.push(serialize(nodeFor(p, i, precision, ids))),
  );
  if (textures.size) {
    const defs = [...textures].map(([src, id]) =>
      serialize(textureNode(id, src)),
    );
    body.unshift(element('defs', {}, defs));
  }
  const attrs = {
    xmlns: SVG_NS,
    width: String(width),
    height: String(height),
    viewBox: `0 0 ${width} ${height}`,
  };
  return `<svg${serializeAttributes(attrs)}>${body.join('')}</svg>`;
}

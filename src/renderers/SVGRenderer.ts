import type { DisplayList } from '../render/DisplayList';
import { Renderer, type RendererOptions } from './Renderer';
import { SVG_NS, backgroundAttributes, nodeFor, textureNode, type SVGIds, type SVGNode } from './svgMarkup';

let instances = 0;

export interface SVGRendererOptions extends RendererOptions {
    /** Existing `<svg>` element to draw into; one is created otherwise. */
    svg?: SVGSVGElement;
    /** Decimal places for coordinates. Default `2`. */
    precision?: number;
}

/**
 * Renders into an `<svg>` element. Elements are reused between frames
 * (only attributes change), which keeps animations cheap.
 */
export class SVGRenderer extends Renderer {
    readonly domElement: SVGSVGElement;
    precision: number;
    private nodes: SVGElement[] = [];
    /** Holds one `<image>` per texture, referenced by the pieces of textured faces. Created on first use. */
    private defs: SVGElement | null = null;
    private textures = new Map<string, string>();
    private ids: SVGIds;

    constructor(options: SVGRendererOptions = {}) {
        super(options);
        this.domElement = options.svg ?? (document.createElementNS(SVG_NS, 'svg') as SVGSVGElement);
        this.precision = options.precision ?? 2;
        // Ids must be unique in the whole document, also with several renderers on one page.
        const prefix = `geo${instances++}`;
        this.ids = {
            clip: (index) => `${prefix}-clip-${index}`,
            texture: (src) => {
                let id = this.textures.get(src);
                if (!id) {
                    id = `${prefix}-tex-${this.textures.size}`;
                    this.textures.set(src, id);
                    if (!this.defs) {
                        this.defs = document.createElementNS(SVG_NS, 'defs') as SVGElement;
                        this.domElement.prepend(this.defs);
                    }
                    this.defs.appendChild(create(textureNode(id, src)));
                }
                return id;
            },
        };
        this.setSize(this.width, this.height);
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        const svg = this.domElement;
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    get mimeType(): string {
        return 'image/svg+xml';
    }

    get fileExtension(): string {
        return 'svg';
    }

    /** The current frame as a standalone SVG document string (the live `<svg>` element, serialized). */
    toSVGString(): string {
        return new XMLSerializer().serializeToString(this.domElement);
    }

    toDataURL(): string {
        return `data:${this.mimeType};charset=utf-8,${encodeURIComponent(this.toSVGString())}`;
    }

    toBlob(): Promise<Blob> {
        return Promise.resolve(new Blob([this.toSVGString()], { type: this.mimeType }));
    }

    draw(list: DisplayList): void {
        let index = 0;
        if (list.background) this.write(index++, { tag: 'rect', attrs: backgroundAttributes(list) });
        list.primitives.forEach((p, i) => this.write(index++, nodeFor(p, i, this.precision, this.ids)));

        // Remove nodes left over from a previous, larger frame.
        for (const node of this.nodes.splice(index)) node.remove();
    }

    /** Make top-level node `index` match `tree`, reusing the existing elements if possible. */
    private write(index: number, tree: SVGNode): void {
        const node = this.nodes[index];
        if (node && node.tagName === tree.tag) {
            sync(node, tree);
            return;
        }
        const fresh = create(tree);
        if (node) node.replaceWith(fresh);
        else this.domElement.appendChild(fresh);
        this.nodes[index] = fresh;
    }
}

function create(tree: SVGNode): SVGElement {
    const node = document.createElementNS(SVG_NS, tree.tag) as SVGElement;
    for (const name in tree.attrs) node.setAttribute(name, tree.attrs[name]);
    for (const child of tree.children ?? []) node.appendChild(create(child));
    return node;
}

/** Update `node` in place to exactly `tree` (attributes and children, recursively). */
function sync(node: SVGElement, tree: SVGNode): void {
    const { attrs } = tree;
    for (const name of node.getAttributeNames()) {
        if (!(name in attrs)) node.removeAttribute(name);
    }
    for (const name in attrs) {
        if (node.getAttribute(name) !== attrs[name]) node.setAttribute(name, attrs[name]);
    }
    const children = tree.children ?? [];
    const existing = Array.from(node.children) as SVGElement[];
    children.forEach((child, i) => {
        const current = existing[i];
        if (current && current.tagName === child.tag) sync(current, child);
        else if (current) current.replaceWith(create(child));
        else node.appendChild(create(child));
    });
    for (const extra of existing.slice(children.length)) extra.remove();
}

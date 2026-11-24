import type { DisplayList } from '../render/DisplayList';
import { Renderer, type RendererOptions } from './Renderer';
import { SVG_NS, attributesFor, backgroundAttributes, tagFor, type SVGTag } from './svgMarkup';

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

    constructor(options: SVGRendererOptions = {}) {
        super(options);
        this.domElement = options.svg ?? (document.createElementNS(SVG_NS, 'svg') as SVGSVGElement);
        this.precision = options.precision ?? 2;
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
        if (list.background) this.write(index++, 'rect', backgroundAttributes(list));
        for (const p of list.primitives) this.write(index++, tagFor(p), attributesFor(p, this.precision));

        // Remove nodes left over from a previous, larger frame.
        for (const node of this.nodes.splice(index)) node.remove();
    }

    /** Make node `index` a `<tag>` with exactly `attrs`, reusing the existing node if possible. */
    private write(index: number, tag: SVGTag, attrs: Record<string, string>): void {
        let node = this.nodes[index];
        if (!node || node.tagName !== tag) {
            const fresh = document.createElementNS(SVG_NS, tag) as SVGElement;
            if (node) node.replaceWith(fresh);
            else this.domElement.appendChild(fresh);
            node = this.nodes[index] = fresh;
        }
        for (const name of node.getAttributeNames()) {
            if (!(name in attrs)) node.removeAttribute(name);
        }
        for (const name in attrs) {
            if (node.getAttribute(name) !== attrs[name]) node.setAttribute(name, attrs[name]);
        }
    }
}

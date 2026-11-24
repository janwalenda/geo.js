import type { DisplayList } from '../render/types';
import { Renderer } from './Renderer';
import { createSvgElement, writeSvgChild } from './svgDom';
import {
  backgroundAttributes,
  nodeFor,
  SVG_NS,
  textureNode,
} from './svgMarkup';
import type { SVGIds, SVGNode, SVGRendererOptions } from './types';

let instances = 0;

/**
 * Renders into an `<svg>` element. Elements are reused between frames
 * (only attributes change), which keeps animations cheap.
 */
export class SVGRenderer extends Renderer {
  override readonly domElement: SVGSVGElement;
  override readonly mimeType = 'image/svg+xml';
  override readonly fileExtension = 'svg';
  precision: number;
  private readonly nodes: SVGElement[] = [];
  /**
   * Holds one `<image>` per texture, referenced by the pieces of textured
   * faces. Created on first use.
   */
  private defs: SVGElement | null = null;
  private readonly textures = new Map<string, string>();
  private readonly ids: SVGIds;

  constructor(options: SVGRendererOptions = {}) {
    super(options);
    this.domElement = options.svg ?? document.createElementNS(SVG_NS, 'svg');
    this.precision = options.precision ?? 2;
    // Ids must be unique in the whole document, also with several renderers
    // on one page.
    const prefix = `geo${instances++}`;
    this.ids = {
      clip: (index) => `${prefix}-clip-${index}`,
      texture: (src) => this.textureId(prefix, src),
    };
    this.setSize(this.width, this.height);
  }

  override setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    const svg = this.domElement;
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  /**
   * The current frame as a standalone SVG document string (the live `<svg>`
   * element, serialized).
   */
  toSVGString(): string {
    return new XMLSerializer().serializeToString(this.domElement);
  }

  override toDataURL(): string {
    const svg = encodeURIComponent(this.toSVGString());
    return `data:${this.mimeType};charset=utf-8,${svg}`;
  }

  override toBlob(): Promise<Blob> {
    return Promise.resolve(
      new Blob([this.toSVGString()], { type: this.mimeType }),
    );
  }

  override draw(list: DisplayList): void {
    let index = 0;
    if (list.background) {
      this.write(index++, { tag: 'rect', attrs: backgroundAttributes(list) });
    }
    list.primitives.forEach((p, i) => {
      this.write(index++, nodeFor(p, i, this.precision, this.ids));
    });

    // Remove nodes left over from a previous, larger frame.
    for (const node of this.nodes.splice(index)) {
      node.remove();
    }
  }

  /**
   * Make top-level node `index` match `tree`, reusing the existing elements
   * if possible.
   */
  private write(index: number, tree: SVGNode): void {
    const node = this.nodes.at(index);
    this.nodes[index] = writeSvgChild(this.domElement, node, tree);
  }

  /** Id of the shared `<image>` for `src`, created in `<defs>` on first use. */
  private textureId(prefix: string, src: string): string {
    const known = this.textures.get(src);
    if (known) {
      return known;
    }
    const id = `${prefix}-tex-${this.textures.size}`;
    this.textures.set(src, id);
    if (!this.defs) {
      this.defs = document.createElementNS(SVG_NS, 'defs');
      this.domElement.prepend(this.defs);
    }
    this.defs.appendChild(createSvgElement(textureNode(id, src)));
    return id;
  }
}

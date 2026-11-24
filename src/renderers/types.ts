/** Options shared by all renderers. */
export interface RendererOptions {
  /** Width in CSS pixels. Default `300`. */
  width?: number;
  /** Height in CSS pixels. Default `150`. */
  height?: number;
  /** Sort primitives back to front. Default `true`. */
  sort?: boolean;
  /** Seam-hiding hairline width in px, `0` to disable. Default `0.5`. */
  seams?: number;
}

/** Options of {@link Renderer.createDownloadLink}. */
export interface DownloadLinkOptions {
  /** File name offered by the browser. Default `geo.<fileExtension>`. */
  filename?: string;
  /** Text content of the link. Default `Download <filename>`. */
  text?: string;
}

/** Image formats a canvas can be exported as. */
export type CanvasImageType = 'image/png' | 'image/jpeg' | 'image/webp';

/** Options of {@link CanvasRenderer}. */
export interface CanvasRendererOptions extends RendererOptions {
  /** Existing `<canvas>` to draw into; one is created otherwise. */
  canvas?: HTMLCanvasElement;
  /** Device pixels per CSS pixel. Default `window.devicePixelRatio` or `1`. */
  pixelRatio?: number;
  /**
   * Image format of exports (`toDataURL`, `toBlob`, downloads). Default
   * `'image/png'`. JPEG has no transparency: give the scene a background or
   * it turns black.
   */
  imageType?: CanvasImageType;
  /**
   * Quality `0…1` for lossy formats (`image/jpeg`, `image/webp`). Default:
   * browser default.
   */
  imageQuality?: number;
}

/** Options of {@link SVGRenderer}. */
export interface SVGRendererOptions extends RendererOptions {
  /** Existing `<svg>` element to draw into; one is created otherwise. */
  svg?: SVGSVGElement;
  /** Decimal places for coordinates. Default `2`. */
  precision?: number;
}

/** Options of {@link toSVGString}. */
export interface SVGStringOptions {
  /** Decimal places for coordinates. Default `2`. */
  precision?: number;
}

/** SVG element a shape primitive becomes. */
export type SVGTag = 'polygon' | 'polyline' | 'circle' | 'rect';

/**
 * Element tree: what a primitive becomes in SVG. Shared by the DOM renderer
 * and the serializer.
 */
export interface SVGNode {
  tag: string;
  attrs: Record<string, string>;
  children?: SVGNode[];
}

/** Document-unique ids for clip paths and shared texture images. */
export interface SVGIds {
  /** Id of the clip path of primitive number `index`. */
  clip(index: number): string;
  /** Id of the shared `<image>` for a texture URL. */
  texture(src: string): string;
}

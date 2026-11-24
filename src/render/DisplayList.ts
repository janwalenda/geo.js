/**
 * Renderer-independent output of the pipeline: flat 2D primitives in screen space
 * (CSS pixels, origin top-left, y down) with fully resolved styles, in draw order.
 * A renderer only has to draw this list from first to last.
 */

/** Resolved style shared by all primitives. Colors are CSS strings. */
export interface PrimitiveStyle {
    /** Fill color, or `null` for no fill. */
    fill: string | null;
    /** Outline color, or `null` for no outline. */
    stroke: string | null;
    /** Outline width in CSS pixels. */
    lineWidth: number;
    /** Opacity in [0, 1] applied to the whole primitive. */
    opacity: number;
}

/** Closed, filled polygon. `points` is flat: [x0, y0, x1, y1, …]. */
export interface PolygonPrimitive extends PrimitiveStyle {
    type: 'polygon';
    points: number[];
    /** Distance from the camera used for sorting (larger = farther). 2D shapes use their z-index. */
    depth: number;
}

/** Open or closed line strip. `points` is flat: [x0, y0, x1, y1, …]. */
export interface PolylinePrimitive extends PrimitiveStyle {
    type: 'polyline';
    points: number[];
    closed: boolean;
    depth: number;
}

/** Circle with a radius in CSS pixels (points, 2D circles). */
export interface CirclePrimitive extends PrimitiveStyle {
    type: 'circle';
    x: number;
    y: number;
    radius: number;
    depth: number;
}

/** Affine 2D transform `[a, b, c, d, e, f]` as in `CanvasRenderingContext2D.setTransform` / SVG `matrix()`. */
export type AffineMatrix = [number, number, number, number, number, number];

/**
 * Piece of a texture: the image is mapped by `transform` from texture space (the unit
 * square, `(0, 0)` = top-left of the image) to the screen and clipped to `points`.
 * Textured faces are made of many of these (one per triangle).
 */
export interface ImagePrimitive {
    type: 'image';
    /** Image URL (see {@link Texture}). */
    src: string;
    /** Texture space → screen space (CSS pixels). */
    transform: AffineMatrix;
    /** Clip polygon in screen space, flat: [x0, y0, x1, y1, …]. */
    points: number[];
    /** Opacity in [0, 1]. */
    opacity: number;
    depth: number;
}

export type Primitive = PolygonPrimitive | PolylinePrimitive | CirclePrimitive | ImagePrimitive;

/** Primitives drawn as a single plain SVG element / Canvas path. */
export type ShapePrimitive = Exclude<Primitive, ImagePrimitive>;

export interface DisplayList {
    /** Viewport width in CSS pixels. */
    width: number;
    /** Viewport height in CSS pixels. */
    height: number;
    /** Background color painted before the primitives, or `null` (transparent). */
    background: string | null;
    /** Primitives in draw order (back to front). */
    primitives: Primitive[];
}

/** Anything that can contribute primitives to a display list (e.g. 2D shapes). */
export interface Drawable {
    toPrimitives(): Primitive[];
}

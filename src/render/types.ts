import type { Mat4 } from '../math/Mat4';
import type { Vec2 } from '../math/Vec2';
import type { Vec3 } from '../math/Vec3';
import type { Color } from '../scene/Color';

// ----------------------------------------------------------- display list

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
  /**
   * Distance from the camera used for sorting (larger = farther). 2D shapes
   * use their z-index.
   */
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

/**
 * Affine 2D transform `[a, b, c, d, e, f]` as in
 * `CanvasRenderingContext2D.setTransform` / SVG `matrix()`.
 */
export type AffineMatrix = [number, number, number, number, number, number];

/**
 * Piece of a texture: the image is mapped by `transform` from texture space
 * (the unit square, `(0, 0)` = top-left of the image) to the screen and
 * clipped to `points`. Textured faces are made of many of these (one per
 * triangle).
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

/** Any primitive of a {@link DisplayList}; narrow by `type`. */
export type Primitive =
  PolygonPrimitive | PolylinePrimitive | CirclePrimitive | ImagePrimitive;

/** Primitives drawn as a single plain SVG element / Canvas path. */
export type ShapePrimitive = Exclude<Primitive, ImagePrimitive>;

/**
 * Renderer-independent output of the pipeline: flat 2D primitives in screen
 * space (CSS pixels, origin top-left, y down) with fully resolved styles, in
 * draw order. A renderer only has to draw this list from first to last.
 */
export interface DisplayList {
  /** Viewport width in CSS pixels. */
  width: number;
  /** Viewport height in CSS pixels. */
  height: number;
  /**
   * Background color painted before the primitives, or `null` (transparent).
   */
  background: string | null;
  /** Primitives in draw order (back to front). */
  primitives: Primitive[];
}

/**
 * Anything that can contribute primitives to a display list (e.g. 2D shapes).
 */
export interface Drawable {
  /** The primitives to draw, in screen space. */
  toPrimitives(): Primitive[];
}

// ----------------------------------------------------------- compile options

/** Options of {@link compile}. */
export interface CompileOptions {
  /** Viewport width in CSS pixels. */
  width: number;
  /** Viewport height in CSS pixels. */
  height: number;
  /**
   * Sort primitives back to front (painter's algorithm). Faces that overlap on
   * screen are ordered by occlusion, everything else by distance. Default
   * `true`.
   */
  sort?: boolean;
  /**
   * Width (px) of a hairline outline in the fill color that hides
   * anti-aliasing seams between adjacent opaque faces. `0` disables it.
   * Default `0.5`.
   */
  seams?: number;
}

// ----------------------------------------------------------- pipeline
// internals

/** The lights of a scene, resolved to world space and premultiplied. */
export interface Lights {
  any: boolean;
  ambient: Color;
  directional: { direction: Vec3; color: Color }[];
  point: { position: Vec3; color: Color }[];
}

/** Projection matrix and viewport size: view space → screen pixels. */
export interface ScreenProjection {
  projection: Mat4;
  width: number;
  height: number;
}

/** Everything the pipeline needs to know about the camera and viewport. */
export interface CompileContext extends ScreenProjection {
  view: Mat4;
  near: number;
  far: number;
  seams: number;
  lights: Lights;
}

/**
 * One unit of the painter's algorithm, e.g. a face with all the primitives it
 * emitted.
 */
export interface DepthItem {
  /**
   * Distance from the camera (larger = farther). Used where occlusion does not
   * decide.
   */
  depth: number;
  /**
   * View-space corners of a (nearly) planar polygon, camera at the origin – or
   * `null` for items without a surface (lines, points), which are ordered by
   * `depth` only.
   */
  polygon: Vec3[] | null;
  /** The same polygon projected to the screen, flat `[x0, y0, x1, y1, …]`. */
  screen: number[] | null;
}

/** A {@link DepthItem} that covers a range of emitted primitives. */
export interface PrimitiveGroup extends DepthItem {
  /** Range `[start, end)` of this group in {@link CompileOutput.primitives}. */
  start: number;
  end: number;
}

/**
 * Primitives emitted so far, grouped per face / line / point (the units that
 * get sorted).
 */
export interface CompileOutput {
  primitives: Primitive[];
  groups: PrimitiveGroup[];
}

/** View-space polygon corner with its texture coordinate. */
export interface Corner {
  p: Vec3;
  uv: Vec2;
}

/** A triangle of {@link Corner}s. */
export type CornerTriangle = readonly [Corner, Corner, Corner];

/**
 * A mesh face before clipping: corner indices and their texture coordinates.
 */
export interface FaceInput {
  /** World-space vertices of the mesh. */
  world: Vec3[];
  /** View-space vertices of the mesh. */
  view: Vec3[];
  /** Indices of the face's corners. */
  face: number[];
  /** Texture coordinates per corner, if the face is textured. */
  uvs: Vec2[] | undefined;
}

/** A face after clipping, projection and culling, ready to be drawn. */
export interface VisibleFace {
  /** Near-clipped view-space corners with texture coordinates. */
  corners: Corner[];
  /** The same corners without texture coordinates. */
  polygon: Vec3[];
  /** The polygon on screen, flat `[x0, y0, x1, y1, …]`. */
  points: number[];
  /** World-space unit normal of the side that faces the camera. */
  normal: Vec3;
  /** World-space center of the face. */
  center: Vec3;
  /** Mean distance from the camera. */
  depth: number;
  /** Whether the face has texture coordinates for every corner. */
  textured: boolean;
}

/** What all image pieces of one textured face share. */
export interface TexturePiece {
  src: string;
  opacity: number;
  depth: number;
  /** Outwards offset of every clip polygon in pixels (hides seams). */
  inflate: number;
}

/** View-space plane `n·p = d` of a face, used for occlusion tests. */
export interface FacePlane {
  index: number;
  polygon: Vec3[];
  screen: number[];
  /** Unit normal and offset of the plane. */
  nx: number;
  ny: number;
  nz: number;
  d: number;
  /** Side of the plane the camera (origin) is on: −1, 0 or 1. */
  eye: number;
  /** Screen-space bounding box. */
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

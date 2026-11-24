import type { Color } from './Color';
import type { Texture } from './Texture';

/**
 * Anything that can be turned into a {@link Color}: CSS hex/rgb()/named
 * string, 0xRRGGBB number or Color.
 */
export type ColorLike = string | number | Color;

/**
 * Which faces are drawn: those facing the camera, those facing away, or both.
 */
export type Side = 'front' | 'back' | 'double';

/** Options of {@link Material}. */
export interface MaterialOptions {
  /** Fill color of faces / points; `null` for no fill. Default `#d0d0d0`. */
  fill?: ColorLike | null;
  /** Outline color; `null` for no outline. Default `null`. */
  stroke?: ColorLike | null;
  /** Outline width in CSS pixels. Default `1`. */
  lineWidth?: number;
  /**
   * Overall opacity in [0, 1], multiplied with the colors' alpha. Default `1`.
   */
  opacity?: number;
  /**
   * Apply flat (Lambert) shading from the scene lights to the fill. Default
   * `true`.
   */
  lit?: boolean;
  /** Face culling. Default `'front'`. */
  side?: Side;
  /** Draw only outlines (fill is ignored). Default `false`. */
  wireframe?: boolean;
  /** Radius of {@link Points} in CSS pixels. Default `3`. */
  pointSize?: number;
  /**
   * Image mapped onto the faces via the geometry's UVs (a {@link Texture} or
   * an image URL). Faces of geometries without UVs fall back to `fill`.
   * Default `null`.
   */
  map?: Texture | string | null;
  /**
   * Subdivisions per triangle edge for textured faces. Texture mapping in 2D
   * is affine, so large faces seen at a steep angle distort; subdividing hides
   * that. `'auto'` chooses 1–8 from the depth range of each triangle. Default
   * `'auto'`.
   */
  textureDetail?: number | 'auto';
}

/** Options of {@link PerspectiveCamera}. */
export interface PerspectiveCameraOptions {
  /** Vertical field of view in **degrees**. Default `50`. */
  fov?: number;
  /**
   * Fixed width / height; leave undefined to follow the renderer's viewport.
   */
  aspect?: number;
  /** Distance of the near clipping plane. Default `0.1`. */
  near?: number;
  /** Distance of the far clipping plane. Default `1000`. */
  far?: number;
}

/** Options of {@link OrthographicCamera}. */
export interface OrthographicCameraOptions {
  /** Half of the visible height in world units. Default `1`. */
  size?: number;
  /**
   * Fixed width / height; leave undefined to follow the renderer's viewport.
   */
  aspect?: number;
  /** Distance of the near clipping plane. Default `0.1`. */
  near?: number;
  /** Distance of the far clipping plane. Default `1000`. */
  far?: number;
}

/** Options of {@link Scene}. */
export interface SceneOptions {
  /**
   * Background color painted by the renderers; `null` (default) keeps the
   * surface transparent.
   */
  background?: ColorLike | null;
}

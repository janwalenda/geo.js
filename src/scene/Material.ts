import { Color, type ColorLike } from './Color';
import { Texture } from './Texture';

/** Which faces are drawn: those facing the camera, those facing away, or both. */
export type Side = 'front' | 'back' | 'double';

export interface MaterialOptions {
    /** Fill color of faces / points; `null` for no fill. Default `#d0d0d0`. */
    fill?: ColorLike | null;
    /** Outline color; `null` for no outline. Default `null`. */
    stroke?: ColorLike | null;
    /** Outline width in CSS pixels. Default `1`. */
    lineWidth?: number;
    /** Overall opacity in [0, 1], multiplied with the colors' alpha. Default `1`. */
    opacity?: number;
    /** Apply flat (Lambert) shading from the scene lights to the fill. Default `true`. */
    lit?: boolean;
    /** Face culling. Default `'front'`. */
    side?: Side;
    /** Draw only outlines (fill is ignored). Default `false`. */
    wireframe?: boolean;
    /** Radius of {@link Points} in CSS pixels. Default `3`. */
    pointSize?: number;
    /**
     * Image mapped onto the faces via the geometry's UVs (a {@link Texture} or an image URL).
     * Faces of geometries without UVs fall back to `fill`. Default `null`.
     */
    map?: Texture | string | null;
    /**
     * Subdivisions per triangle edge for textured faces. Texture mapping in 2D is affine,
     * so large faces seen at a steep angle distort; subdividing hides that.
     * `'auto'` chooses 1–8 from the depth range of each triangle. Default `'auto'`.
     */
    textureDetail?: number | 'auto';
}

/**
 * Renderer-independent surface description. Both the Canvas and the SVG renderer
 * interpret it identically, because the pipeline resolves it into final colors.
 */
export class Material {
    fill: Color | null;
    stroke: Color | null;
    lineWidth: number;
    opacity: number;
    lit: boolean;
    side: Side;
    wireframe: boolean;
    pointSize: number;
    map: Texture | null;
    textureDetail: number | 'auto';

    constructor(options: MaterialOptions = {}) {
        this.fill = options.fill === null ? null : Color.from(options.fill ?? '#d0d0d0');
        this.stroke = options.stroke == null ? null : Color.from(options.stroke);
        this.lineWidth = options.lineWidth ?? 1;
        this.opacity = options.opacity ?? 1;
        this.lit = options.lit ?? true;
        this.side = options.side ?? 'front';
        this.wireframe = options.wireframe ?? false;
        this.pointSize = options.pointSize ?? 3;
        const map = options.map ?? null;
        this.map = typeof map === 'string' ? new Texture(map) : map;
        this.textureDetail = options.textureDetail ?? 'auto';
    }

    clone(): Material {
        const m = new Material();
        m.fill = this.fill?.clone() ?? null;
        m.stroke = this.stroke?.clone() ?? null;
        m.lineWidth = this.lineWidth;
        m.opacity = this.opacity;
        m.lit = this.lit;
        m.side = this.side;
        m.wireframe = this.wireframe;
        m.pointSize = this.pointSize;
        m.map = this.map?.clone() ?? null;
        m.textureDetail = this.textureDetail;
        return m;
    }
}

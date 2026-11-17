import { Color, type ColorLike } from './Color';

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

    constructor(options: MaterialOptions = {}) {
        this.fill = options.fill === null ? null : Color.from(options.fill ?? '#d0d0d0');
        this.stroke = options.stroke == null ? null : Color.from(options.stroke);
        this.lineWidth = options.lineWidth ?? 1;
        this.opacity = options.opacity ?? 1;
        this.lit = options.lit ?? true;
        this.side = options.side ?? 'front';
        this.wireframe = options.wireframe ?? false;
        this.pointSize = options.pointSize ?? 3;
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
        return m;
    }
}

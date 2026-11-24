import { Color } from './Color';
import { definedOnly } from './helpers';
import { Texture } from './Texture';
import type { MaterialOptions } from './types';
import type { Side } from './types';

/** Values of all {@link MaterialOptions} that are not given. */
const MATERIAL_DEFAULTS: Required<MaterialOptions> = {
  fill: '#d0d0d0',
  stroke: null,
  lineWidth: 1,
  opacity: 1,
  lit: true,
  side: 'front',
  wireframe: false,
  pointSize: 3,
  map: null,
  textureDetail: 'auto',
};

/**
 * Renderer-independent surface description. Both the Canvas and the SVG
 * renderer interpret it identically, because the pipeline resolves it into
 * final colors.
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
    const o = { ...MATERIAL_DEFAULTS, ...definedOnly(options) };
    this.fill = o.fill === null ? null : Color.from(o.fill);
    this.stroke = o.stroke === null ? null : Color.from(o.stroke);
    this.lineWidth = o.lineWidth;
    this.opacity = o.opacity;
    this.lit = o.lit;
    this.side = o.side;
    this.wireframe = o.wireframe;
    this.pointSize = o.pointSize;
    this.map = typeof o.map === 'string' ? new Texture(o.map) : o.map;
    this.textureDetail = o.textureDetail;
  }

  /** A new material with the same settings (colors and texture are copied). */
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

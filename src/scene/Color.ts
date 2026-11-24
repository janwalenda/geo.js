import { clamp } from '../math/utils';
import { hexToRgba, parseCssColor, toByte } from './colorParsing';
import type { ColorLike } from './types';

/**
 * Linear RGBA color with channels in [0, 1]. Methods mutate `this`.
 * Colors are numeric (not CSS strings) so the pipeline can shade them.
 */
export class Color {
  constructor(
    public r = 1,
    public g = 1,
    public b = 1,
    public a = 1,
  ) {}

  /**
   * Parse a {@link ColorLike}. Throws on unsupported strings so mistakes
   * surface early.
   */
  static from(value: ColorLike): Color {
    if (value instanceof Color) {
      return value.clone();
    }
    if (typeof value === 'number') {
      return new Color().setHex(value);
    }
    return Color.parse(value);
  }

  /**
   * Parse `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`,
   * `transparent` or a basic color name.
   */
  static parse(css: string): Color {
    const rgba = parseCssColor(css);
    if (!rgba) {
      throw new Error(`geo: unsupported color "${css}"`);
    }
    return new Color(...rgba);
  }

  /**
   * Set the channels in [0, 1] (alpha defaults to the current one). Mutates and
   * returns `this`.
   */
  set(r: number, g: number, b: number, a = this.a): this {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    return this;
  }

  /**
   * Set from a `0xRRGGBB` number and an alpha in [0, 1]. Mutates and returns
   * `this`.
   */
  setHex(hex: number, alpha = 1): this {
    return this.set(...hexToRgba(hex, alpha));
  }

  /** Copy all channels of `c`. Mutates and returns `this`. */
  copy(c: Color): this {
    return this.set(c.r, c.g, c.b, c.a);
  }

  /** A new, independent copy. */
  clone(): Color {
    return new Color(this.r, this.g, this.b, this.a);
  }

  /** Multiply RGB by a scalar (alpha unchanged). */
  scale(s: number): this {
    return this.set(this.r * s, this.g * s, this.b * s);
  }

  /** Component-wise RGB multiplication (alpha unchanged). */
  multiply(c: Color): this {
    return this.set(this.r * c.r, this.g * c.g, this.b * c.b);
  }

  /** Component-wise RGB addition (alpha unchanged). */
  add(c: Color): this {
    return this.set(this.r + c.r, this.g + c.g, this.b + c.b);
  }

  /**
   * Linear interpolation of all channels towards `c` by `t`. Mutates and
   * returns `this`.
   */
  lerp(c: Color, t: number): this {
    return this.set(
      this.r + (c.r - this.r) * t,
      this.g + (c.g - this.g) * t,
      this.b + (c.b - this.b) * t,
      this.a + (c.a - this.a) * t,
    );
  }

  /** Clamp every channel to [0, 1]. Mutates and returns `this`. */
  clamp(): this {
    return this.set(
      clamp(this.r, 0, 1),
      clamp(this.g, 0, 1),
      clamp(this.b, 0, 1),
      clamp(this.a, 0, 1),
    );
  }

  /** RGB as a `0xRRGGBB` number (channels clamped; alpha ignored). */
  getHex(): number {
    return (toByte(this.r) << 16) | (toByte(this.g) << 8) | toByte(this.b);
  }

  /** CSS string: `#rrggbb` when opaque, otherwise `rgba(r, g, b, a)`. */
  toCSS(): string {
    if (this.a >= 1) {
      return `#${this.getHex().toString(16).padStart(6, '0')}`;
    }
    const [r, g, b] = [this.r, this.g, this.b].map(toByte);
    const alpha = Number(clamp(this.a, 0, 1).toFixed(3));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Channel-wise comparison with a tolerance of `epsilon` (default: half an
   * 8-bit step).
   */
  equals(c: Color, epsilon = 1 / 512): boolean {
    return (
      Math.abs(this.r - c.r) <= epsilon &&
      Math.abs(this.g - c.g) <= epsilon &&
      Math.abs(this.b - c.b) <= epsilon &&
      Math.abs(this.a - c.a) <= epsilon
    );
  }
}

import { clamp } from '../math/utils';

/** Anything that can be turned into a {@link Color}: CSS hex/rgb()/named string, 0xRRGGBB number or Color. */
export type ColorLike = string | number | Color;

const NAMED: Record<string, number> = {
    black: 0x000000, white: 0xffffff, red: 0xff0000, green: 0x008000, lime: 0x00ff00,
    blue: 0x0000ff, yellow: 0xffff00, cyan: 0x00ffff, magenta: 0xff00ff, orange: 0xffa500,
    purple: 0x800080, gray: 0x808080, grey: 0x808080, silver: 0xc0c0c0, navy: 0x000080,
    teal: 0x008080, maroon: 0x800000, olive: 0x808000, pink: 0xffc0cb, brown: 0xa52a2a,
};

/**
 * Linear RGBA color with channels in [0, 1]. Methods mutate `this`.
 * Colors are numeric (not CSS strings) so the pipeline can shade them.
 */
export class Color {
    constructor(public r = 1, public g = 1, public b = 1, public a = 1) {}

    /** Parse a {@link ColorLike}. Throws on unsupported strings so mistakes surface early. */
    static from(value: ColorLike): Color {
        if (value instanceof Color) return value.clone();
        if (typeof value === 'number') return new Color().setHex(value);
        return Color.parse(value);
    }

    /** Parse `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `transparent` or a basic color name. */
    static parse(css: string): Color {
        const s = css.trim().toLowerCase();
        if (s === 'transparent') return new Color(0, 0, 0, 0);
        if (s in NAMED) return new Color().setHex(NAMED[s]);

        const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
        if (hex) {
            let h = hex[1];
            if (h.length <= 4) h = [...h].map((c) => c + c).join('');
            const n = parseInt(h.slice(0, 6), 16);
            const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
            return new Color().setHex(n, a);
        }

        const rgb = /^rgba?\(\s*([^)]+)\)$/.exec(s);
        if (rgb) {
            const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
            if (parts.length === 3 || parts.length === 4) {
                const channel = (p: string) => (p.endsWith('%') ? parseFloat(p) / 100 : parseFloat(p) / 255);
                const alpha = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
                const values = [channel(parts[0]), channel(parts[1]), channel(parts[2]), alpha];
                if (values.every(Number.isFinite)) return new Color(...(values as [number, number, number, number])).clamp();
            }
        }
        throw new Error(`geo: unsupported color "${css}"`);
    }

    set(r: number, g: number, b: number, a = this.a): this {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;
    }

    setHex(hex: number, alpha = 1): this {
        return this.set(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255, alpha);
    }

    copy(c: Color): this {
        return this.set(c.r, c.g, c.b, c.a);
    }

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

    lerp(c: Color, t: number): this {
        return this.set(
            this.r + (c.r - this.r) * t,
            this.g + (c.g - this.g) * t,
            this.b + (c.b - this.b) * t,
            this.a + (c.a - this.a) * t,
        );
    }

    clamp(): this {
        return this.set(clamp(this.r, 0, 1), clamp(this.g, 0, 1), clamp(this.b, 0, 1), clamp(this.a, 0, 1));
    }

    getHex(): number {
        const c = (v: number) => Math.round(clamp(v, 0, 1) * 255);
        return (c(this.r) << 16) | (c(this.g) << 8) | c(this.b);
    }

    /** CSS string: `#rrggbb` when opaque, otherwise `rgba(r, g, b, a)`. */
    toCSS(): string {
        if (this.a >= 1) return `#${this.getHex().toString(16).padStart(6, '0')}`;
        const c = (v: number) => Math.round(clamp(v, 0, 1) * 255);
        return `rgba(${c(this.r)}, ${c(this.g)}, ${c(this.b)}, ${+clamp(this.a, 0, 1).toFixed(3)})`;
    }

    equals(c: Color, epsilon = 1 / 512): boolean {
        return (
            Math.abs(this.r - c.r) <= epsilon &&
            Math.abs(this.g - c.g) <= epsilon &&
            Math.abs(this.b - c.b) <= epsilon &&
            Math.abs(this.a - c.a) <= epsilon
        );
    }
}

import { clamp } from '../math/utils';

/** RGBA channels in [0, 1]. */
type Rgba = [number, number, number, number];

const NAMED: Readonly<Record<string, number>> = {
  black: 0x000000,
  white: 0xffffff,
  red: 0xff0000,
  green: 0x008000,
  lime: 0x00ff00,
  blue: 0x0000ff,
  yellow: 0xffff00,
  cyan: 0x00ffff,
  magenta: 0xff00ff,
  orange: 0xffa500,
  purple: 0x800080,
  gray: 0x808080,
  grey: 0x808080,
  silver: 0xc0c0c0,
  navy: 0x000080,
  teal: 0x008080,
  maroon: 0x800000,
  olive: 0x808000,
  pink: 0xffc0cb,
  brown: 0xa52a2a,
};

/** Channels of a 0xRRGGBB number. */
export function hexToRgba(hex: number, alpha = 1): Rgba {
  return [
    ((hex >> 16) & 255) / 255,
    ((hex >> 8) & 255) / 255,
    (hex & 255) / 255,
    alpha,
  ];
}

/** A channel in [0, 1] as a byte (0–255), clamped. */
export function toByte(v: number): number {
  return Math.round(clamp(v, 0, 1) * 255);
}

/**
 * Parse `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`,
 * `transparent` or a basic color name. Returns `null` for anything else.
 */
export function parseCssColor(css: string): Rgba | null {
  const s = css.trim().toLowerCase();
  if (s === 'transparent') {
    return [0, 0, 0, 0];
  }
  if (s in NAMED) {
    return hexToRgba(NAMED[s]);
  }
  return parseHexColor(s) ?? parseRgbColor(s);
}

/** `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`. */
function parseHexColor(s: string): Rgba | null {
  const match = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (!match) {
    return null;
  }
  let h = match[1];
  if (h.length <= 4) {
    h = Array.from(h, (c) => c + c).join('');
  }
  const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return hexToRgba(parseInt(h.slice(0, 6), 16), alpha);
}

/** `rgb(r, g, b)` or `rgba(r, g, b, a)`, channels as numbers or percent. */
function parseRgbColor(s: string): Rgba | null {
  const match = /^rgba?\(\s*([^)]+)\)$/.exec(s);
  const parts = match?.[1].split(/[\s,/]+/).filter(Boolean) ?? [];
  if (parts.length !== 3 && parts.length !== 4) {
    return null;
  }
  const [r, g, b] = parts;
  const values: Rgba = [
    parseChannel(r, 255),
    parseChannel(g, 255),
    parseChannel(b, 255),
    parts.length === 4 ? parseChannel(parts[3], 1) : 1,
  ];
  if (!values.every(Number.isFinite)) {
    return null;
  }
  return values.map((v) => clamp(v, 0, 1)) as Rgba;
}

/** A channel given as a number in [0, `max`] or as a percentage. */
function parseChannel(text: string, max: number): number {
  return text.endsWith('%') ? parseFloat(text) / 100 : parseFloat(text) / max;
}

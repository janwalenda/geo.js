/**
 * Image mapped onto mesh faces through their UV coordinates.
 * Renderer-independent: it only stores the image URL (an `http(s):`, relative
 * or `data:` URL). The renderers load and cache the actual image.
 *
 * Texture space: `(0, 0)` is the top-left and `(1, 1)` the bottom-right corner
 * of the image.
 */
export class Texture {
  /** @param src image URL, e.g. `'brick.png'` or a `data:` URL */
  constructor(public src: string) {}

  /** A new texture with the same image URL. */
  clone(): Texture {
    return new Texture(this.src);
  }
}

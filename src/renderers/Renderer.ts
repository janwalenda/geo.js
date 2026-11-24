import { compile } from '../render/compile';
import type { DisplayList, Drawable } from '../render/types';
import type { Camera } from '../scene/Camera';
import type { Object3D } from '../scene/Object3D';
import type { DownloadLinkOptions, RendererOptions } from './types';

/**
 * Common base of all renderers. Subclasses only implement
 * {@link Renderer.draw} (and sizing and export); scene compilation is shared,
 * so every renderer produces the same image.
 */
export abstract class Renderer {
  width: number;
  height: number;
  sort: boolean;
  seams: number;

  /** The element the renderer draws into (`<canvas>` or `<svg>`). */
  abstract readonly domElement: Element;
  /** MIME type of exported files, e.g. `image/svg+xml` or `image/png`. */
  abstract readonly mimeType: string;
  /** File extension of exported files without the dot, e.g. `svg`. */
  abstract readonly fileExtension: string;

  protected constructor(options: RendererOptions = {}) {
    this.width = options.width ?? 300;
    this.height = options.height ?? 150;
    this.sort = options.sort ?? true;
    this.seams = options.seams ?? 0.5;
  }

  /**
   * Create an `<a download>` element pointing at a snapshot of the current
   * frame. The link uses a `data:` URL, so it needs no cleanup and keeps
   * showing this frame even after the renderer draws the next one. Call it
   * again for a fresh snapshot.
   */
  createDownloadLink(options: DownloadLinkOptions = {}): HTMLAnchorElement {
    const filename = options.filename ?? `geo.${this.fileExtension}`;
    const link = document.createElement('a');
    link.href = this.toDataURL();
    link.download = filename;
    link.type = this.mimeType;
    link.textContent = options.text ?? `Download ${filename}`;
    return link;
  }

  /**
   * Save the current frame as a file by triggering a browser download.
   * Uses a temporary object URL (works for large canvases), revoked
   * afterwards.
   */
  async download(filename = `geo.${this.fileExtension}`): Promise<void> {
    const url = URL.createObjectURL(await this.toBlob());
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      // Revoke after the click has been handled; revoking synchronously can
      // cancel the download.
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 0);
    }
  }

  /**
   * Compile `scene` for `camera` and draw it. `overlay` drawables (e.g. 2D
   * shapes) are drawn on top in the given order. Returns the drawn display
   * list.
   */
  render(
    scene: Object3D,
    camera: Camera,
    overlay: Drawable[] = [],
  ): DisplayList {
    const list = compile(scene, camera, {
      width: this.width,
      height: this.height,
      sort: this.sort,
      seams: this.seams,
    });
    for (const drawable of overlay) {
      list.primitives.push(...drawable.toPrimitives());
    }
    this.draw(list);
    return list;
  }

  /** Draw only 2D drawables (no 3D scene). */
  render2D(
    drawables: Drawable[],
    background: string | null = null,
  ): DisplayList {
    const list: DisplayList = {
      width: this.width,
      height: this.height,
      background,
      primitives: drawables.flatMap((d) => d.toPrimitives()),
    };
    this.draw(list);
    return list;
  }

  /** Resize the drawing surface (CSS pixels). */
  abstract setSize(width: number, height: number): void;

  /** Draw a display list, replacing the previous frame. */
  abstract draw(list: DisplayList): void;

  /** The current frame as a self-contained `data:` URL (synchronous). */
  abstract toDataURL(): string;

  /** The current frame as a `Blob` of type {@link Renderer.mimeType}. */
  abstract toBlob(): Promise<Blob>;
}

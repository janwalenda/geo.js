// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DisplayList } from '../../src/render';
import { CanvasRenderer } from '../../src/renderers/CanvasRenderer';

/** Minimal stand-in for CanvasRenderingContext2D that records what is drawn. */
function fakeCanvas() {
  const calls: string[] = [];
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    lineJoin: '',
    lineCap: '',
    setTransform: (...a: number[]) =>
      calls.push(`setTransform(${a.join(',')})`),
    clearRect: () => calls.push('clearRect'),
    fillRect: () => calls.push(`fillRect ${ctx.fillStyle}`),
    beginPath: () => calls.push('beginPath'),
    moveTo: (x: number, y: number) => calls.push(`moveTo ${x},${y}`),
    lineTo: (x: number, y: number) => calls.push(`lineTo ${x},${y}`),
    closePath: () => calls.push('closePath'),
    arc: (x: number, y: number, r: number) => calls.push(`arc ${x},${y},${r}`),
    fill: () => calls.push(`fill ${ctx.fillStyle} α${ctx.globalAlpha}`),
    stroke: () =>
      calls.push(
        `stroke ${ctx.strokeStyle} ${ctx.lineWidth} α${ctx.globalAlpha}`,
      ),
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    clip: () => calls.push('clip'),
    drawImage: (img: { src: string }, ...a: number[]) =>
      calls.push(`drawImage ${img.src} ${a.join(',')} α${ctx.globalAlpha}`),
  };
  const exports: { type?: string; quality?: number }[] = [];
  const canvas = {
    width: 0,
    height: 0,
    style: { width: '', height: '' },
    getContext: () => ctx,
    toDataURL: (type?: string, quality?: number) => {
      exports.push({ type, quality });
      return `data:${type};base64,AAAA`;
    },
    toBlob: (
      callback: (blob: Blob | null) => void,
      type?: string,
      quality?: number,
    ) => {
      exports.push({ type, quality });
      callback(type === 'image/broken' ? null : new Blob(['img'], { type }));
    },
  };
  return {
    canvas: canvas as unknown as HTMLCanvasElement,
    calls,
    ctx,
    exports,
  };
}

const list: DisplayList = {
  width: 100,
  height: 50,
  background: '#ffffff',
  primitives: [
    {
      type: 'polygon',
      points: [0, 0, 10, 0, 10, 10],
      fill: '#ff0000',
      stroke: '#000000',
      lineWidth: 2,
      opacity: 1,
      depth: 2,
    },
    {
      type: 'polyline',
      points: [0, 0, 5, 5],
      closed: false,
      fill: '#123456',
      stroke: '#00ff00',
      lineWidth: 1,
      opacity: 0.5,
      depth: 1,
    },
    {
      type: 'circle',
      x: 3,
      y: 4,
      radius: 2,
      fill: '#0000ff',
      stroke: null,
      lineWidth: 1,
      opacity: 1,
      depth: 0,
    },
  ],
};

describe('CanvasRenderer', () => {
  it('sizes the backing store by the pixel ratio and the CSS size by the viewport', () => {
    const { canvas } = fakeCanvas();
    new CanvasRenderer({ canvas, width: 100, height: 50, pixelRatio: 2 });
    expect([canvas.width, canvas.height]).toEqual([200, 100]);
    expect(canvas.style.width).toBe('100px');
  });

  it('draws primitives in order with the same semantics as the SVG renderer', () => {
    const { canvas, calls, ctx } = fakeCanvas();
    const renderer = new CanvasRenderer({
      canvas,
      width: 100,
      height: 50,
      pixelRatio: 2,
    });
    renderer.draw(list);
    expect(calls).toEqual([
      'setTransform(1,0,0,1,0,0)',
      'clearRect',
      'setTransform(2,0,0,2,0,0)',
      'fillRect #ffffff',
      'beginPath',
      'moveTo 0,0',
      'lineTo 10,0',
      'lineTo 10,10',
      'closePath',
      'fill #ff0000 α1',
      'stroke #000000 2 α1',
      // polylines are never filled, exactly like <polyline fill="none">
      'beginPath',
      'moveTo 0,0',
      'lineTo 5,5',
      'stroke #00ff00 1 α0.5',
      'beginPath',
      'arc 3,4,2',
      'fill #0000ff α1',
    ]);
    expect(ctx.lineJoin).toBe('round');
    expect(ctx.globalAlpha).toBe(1);
  });

  it('throws a clear error without a 2D context', () => {
    const canvas = { getContext: () => null } as unknown as HTMLCanvasElement;
    expect(() => new CanvasRenderer({ canvas })).toThrow(/2D context/);
  });
});

describe('CanvasRenderer export', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('exports PNG by default', async () => {
    const { canvas, exports } = fakeCanvas();
    const renderer = new CanvasRenderer({ canvas });
    expect(renderer.mimeType).toBe('image/png');
    expect(renderer.fileExtension).toBe('png');
    expect(renderer.toDataURL()).toBe('data:image/png;base64,AAAA');
    const blob = await renderer.toBlob();
    expect(blob.type).toBe('image/png');
    expect(exports).toEqual([
      { type: 'image/png', quality: undefined },
      { type: 'image/png', quality: undefined },
    ]);
  });

  it('passes image type and quality through and picks the matching extension', async () => {
    const { canvas, exports } = fakeCanvas();
    const renderer = new CanvasRenderer({
      canvas,
      imageType: 'image/jpeg',
      imageQuality: 0.8,
    });
    expect(renderer.fileExtension).toBe('jpg');
    await renderer.toBlob();
    expect(exports).toEqual([{ type: 'image/jpeg', quality: 0.8 }]);
    renderer.imageType = 'image/webp';
    expect(renderer.fileExtension).toBe('webp');
    expect(renderer.createDownloadLink().download).toBe('geo.webp');
  });

  it('rejects when the canvas cannot be encoded', async () => {
    const { canvas } = fakeCanvas();
    const renderer = new CanvasRenderer({ canvas });
    (renderer as { imageType: string }).imageType = 'image/broken';
    await expect(renderer.toBlob()).rejects.toThrow(/could not be encoded/);
  });

  it('creates a download link with a data URL snapshot', () => {
    const { canvas } = fakeCanvas();
    const link = new CanvasRenderer({ canvas }).createDownloadLink({
      filename: 'scene.png',
      text: 'Save',
    });
    expect(link.tagName).toBe('A');
    expect(link.href).toBe('data:image/png;base64,AAAA');
    expect(link.download).toBe('scene.png');
    expect(link.type).toBe('image/png');
    expect(link.textContent).toBe('Save');
  });

  it('downloads through a temporary object URL that is revoked afterwards', async () => {
    vi.useFakeTimers();
    const create = vi.fn<(blob: Blob) => string>(() => 'blob:geo-1');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    let attached = false;
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        attached = document.body.contains(this);
      });

    const { canvas } = fakeCanvas();
    await new CanvasRenderer({ canvas }).download();
    expect(create.mock.calls[0][0].type).toBe('image/png');
    const clicked = click.mock.contexts[0] as HTMLAnchorElement;
    expect(attached).toBe(true);
    expect(clicked.href).toBe('blob:geo-1');
    expect(clicked.download).toBe('geo.png');
    expect(document.body.contains(clicked)).toBe(false);
    expect(revoke).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith('blob:geo-1');
  });
});

describe('CanvasRenderer textures', () => {
  /** Image stand-in: "loads" when `load()` is called. */
  class FakeImage {
    static all: FakeImage[] = [];
    src = '';
    complete = false;
    naturalWidth = 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor() {
      FakeImage.all.push(this);
    }
    load(): void {
      this.complete = true;
      this.naturalWidth = 4;
      this.onload?.();
    }
  }
  const piece: DisplayList = {
    width: 100,
    height: 50,
    background: null,
    primitives: [
      {
        type: 'image',
        src: 'tex.png',
        transform: [10, 0, 0, 20, 3, 4],
        points: [0, 0, 10, 0, 0, 10],
        opacity: 0.5,
        depth: 0,
      },
    ],
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    FakeImage.all = [];
  });

  it('skips pieces until the image is loaded, then clips and draws it under the affine map', async () => {
    vi.stubGlobal('Image', FakeImage);
    const { canvas, calls } = fakeCanvas();
    const renderer = new CanvasRenderer({
      canvas,
      width: 100,
      height: 50,
      pixelRatio: 2,
    });
    const loaded = vi.fn();
    renderer.onTextureLoad = loaded;
    renderer.draw(piece);
    expect(calls.some((c) => c.startsWith('drawImage'))).toBe(false);
    expect(FakeImage.all).toHaveLength(1);
    expect(FakeImage.all[0].src).toBe('tex.png');

    const ready = renderer.loadTextures(piece);
    FakeImage.all[0].load();
    await ready;
    expect(loaded).toHaveBeenCalledWith('tex.png');

    calls.length = 0;
    renderer.draw(piece);
    expect(calls.slice(3)).toEqual([
      'save',
      'beginPath',
      'moveTo 0,0',
      'lineTo 10,0',
      'lineTo 0,10',
      'closePath',
      'clip',
      'setTransform(20,0,0,40,6,8)',
      'drawImage tex.png 0,0,1,1 α0.5',
      'restore',
    ]);
    expect(FakeImage.all).toHaveLength(1); // cached
  });

  it('resolves loadTextures for images that fail to load', async () => {
    vi.stubGlobal('Image', FakeImage);
    const { canvas } = fakeCanvas();
    const renderer = new CanvasRenderer({ canvas });
    const ready = renderer.loadTextures(piece);
    FakeImage.all[0].onerror?.();
    await expect(ready).resolves.toBeUndefined();
  });
});

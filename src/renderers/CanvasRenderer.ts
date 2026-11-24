import type { DisplayList, Primitive } from '../render/DisplayList';
import { Renderer, type RendererOptions } from './Renderer';

export interface CanvasRendererOptions extends RendererOptions {
    /** Existing `<canvas>` to draw into; one is created otherwise. */
    canvas?: HTMLCanvasElement;
    /** Device pixels per CSS pixel. Default `window.devicePixelRatio` or `1`. */
    pixelRatio?: number;
    /**
     * Image format of exports (`toDataURL`, `toBlob`, downloads). Default `'image/png'`.
     * JPEG has no transparency: give the scene a background or it turns black.
     */
    imageType?: CanvasImageType;
    /** Quality `0…1` for lossy formats (`image/jpeg`, `image/webp`). Default: browser default. */
    imageQuality?: number;
}

/** Image formats a canvas can be exported as. */
export type CanvasImageType = 'image/png' | 'image/jpeg' | 'image/webp';

const EXTENSIONS: Record<CanvasImageType, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/** Renders into a `<canvas>` with the 2D context, sharp on high-DPI screens. */
export class CanvasRenderer extends Renderer {
    readonly domElement: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    pixelRatio: number;
    imageType: CanvasImageType;
    imageQuality: number | undefined;

    constructor(options: CanvasRendererOptions = {}) {
        super(options);
        this.domElement = options.canvas ?? document.createElement('canvas');
        const context = this.domElement.getContext('2d');
        if (!context) throw new Error('geo: canvas 2D context is not available');
        this.context = context;
        this.pixelRatio = options.pixelRatio ?? globalThis.devicePixelRatio ?? 1;
        this.imageType = options.imageType ?? 'image/png';
        this.imageQuality = options.imageQuality;
        this.setSize(this.width, this.height);
    }

    get mimeType(): string {
        return this.imageType;
    }

    get fileExtension(): string {
        return EXTENSIONS[this.imageType];
    }

    /** The current frame at full backing-store resolution (CSS size × `pixelRatio`). */
    toDataURL(): string {
        return this.domElement.toDataURL(this.imageType, this.imageQuality);
    }

    /** The current frame at full backing-store resolution (CSS size × `pixelRatio`). */
    toBlob(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this.domElement.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error('geo: canvas could not be encoded as an image'))),
                this.imageType,
                this.imageQuality,
            );
        });
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        const canvas = this.domElement;
        canvas.width = Math.round(width * this.pixelRatio);
        canvas.height = Math.round(height * this.pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    }

    draw(list: DisplayList): void {
        const ctx = this.context;
        const ratio = this.pixelRatio;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.domElement.width, this.domElement.height);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        if (list.background) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = list.background;
            ctx.fillRect(0, 0, list.width, list.height);
        }
        for (const p of list.primitives) this.drawPrimitive(p);
        ctx.globalAlpha = 1;
    }

    private drawPrimitive(p: Primitive): void {
        const ctx = this.context;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        if (p.type === 'circle') {
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        } else {
            ctx.moveTo(p.points[0], p.points[1]);
            for (let i = 2; i < p.points.length; i += 2) ctx.lineTo(p.points[i], p.points[i + 1]);
            if (p.type === 'polygon' || p.closed) ctx.closePath();
        }
        if (p.fill && p.type !== 'polyline') {
            ctx.fillStyle = p.fill;
            ctx.fill();
        }
        if (p.stroke) {
            ctx.strokeStyle = p.stroke;
            ctx.lineWidth = p.lineWidth;
            ctx.stroke();
        }
    }
}

import type { DisplayList, Primitive } from '../render/DisplayList';
import { Renderer, type RendererOptions } from './Renderer';

export interface CanvasRendererOptions extends RendererOptions {
    /** Existing `<canvas>` to draw into; one is created otherwise. */
    canvas?: HTMLCanvasElement;
    /** Device pixels per CSS pixel. Default `window.devicePixelRatio` or `1`. */
    pixelRatio?: number;
}

/** Renders into a `<canvas>` with the 2D context, sharp on high-DPI screens. */
export class CanvasRenderer extends Renderer {
    readonly domElement: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    pixelRatio: number;

    constructor(options: CanvasRendererOptions = {}) {
        super(options);
        this.domElement = options.canvas ?? document.createElement('canvas');
        const context = this.domElement.getContext('2d');
        if (!context) throw new Error('geo: canvas 2D context is not available');
        this.context = context;
        this.pixelRatio = options.pixelRatio ?? globalThis.devicePixelRatio ?? 1;
        this.setSize(this.width, this.height);
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

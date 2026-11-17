import { describe, expect, it } from 'vitest';
import type { DisplayList } from '../../src/render';
import { CanvasRenderer } from '../../src/renderers/CanvasRenderer';

/** Minimal stand-in for CanvasRenderingContext2D that records what is drawn. */
function fakeCanvas() {
    const calls: string[] = [];
    const ctx = {
        fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, lineJoin: '', lineCap: '',
        setTransform: (...a: number[]) => calls.push(`setTransform(${a.join(',')})`),
        clearRect: () => calls.push('clearRect'),
        fillRect: () => calls.push(`fillRect ${ctx.fillStyle}`),
        beginPath: () => calls.push('beginPath'),
        moveTo: (x: number, y: number) => calls.push(`moveTo ${x},${y}`),
        lineTo: (x: number, y: number) => calls.push(`lineTo ${x},${y}`),
        closePath: () => calls.push('closePath'),
        arc: (x: number, y: number, r: number) => calls.push(`arc ${x},${y},${r}`),
        fill: () => calls.push(`fill ${ctx.fillStyle} α${ctx.globalAlpha}`),
        stroke: () => calls.push(`stroke ${ctx.strokeStyle} ${ctx.lineWidth} α${ctx.globalAlpha}`),
    };
    const canvas = { width: 0, height: 0, style: { width: '', height: '' }, getContext: () => ctx };
    return { canvas: canvas as unknown as HTMLCanvasElement, calls, ctx };
}

const list: DisplayList = {
    width: 100,
    height: 50,
    background: '#ffffff',
    primitives: [
        { type: 'polygon', points: [0, 0, 10, 0, 10, 10], fill: '#ff0000', stroke: '#000000', lineWidth: 2, opacity: 1, depth: 2 },
        { type: 'polyline', points: [0, 0, 5, 5], closed: false, fill: '#123456', stroke: '#00ff00', lineWidth: 1, opacity: 0.5, depth: 1 },
        { type: 'circle', x: 3, y: 4, radius: 2, fill: '#0000ff', stroke: null, lineWidth: 1, opacity: 1, depth: 0 },
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
        const renderer = new CanvasRenderer({ canvas, width: 100, height: 50, pixelRatio: 2 });
        renderer.draw(list);
        expect(calls).toEqual([
            'setTransform(1,0,0,1,0,0)', 'clearRect', 'setTransform(2,0,0,2,0,0)',
            'fillRect #ffffff',
            'beginPath', 'moveTo 0,0', 'lineTo 10,0', 'lineTo 10,10', 'closePath', 'fill #ff0000 α1', 'stroke #000000 2 α1',
            // polylines are never filled, exactly like <polyline fill="none">
            'beginPath', 'moveTo 0,0', 'lineTo 5,5', 'stroke #00ff00 1 α0.5',
            'beginPath', 'arc 3,4,2', 'fill #0000ff α1',
        ]);
        expect(ctx.lineJoin).toBe('round');
        expect(ctx.globalAlpha).toBe(1);
    });

    it('throws a clear error without a 2D context', () => {
        const canvas = { getContext: () => null } as unknown as HTMLCanvasElement;
        expect(() => new CanvasRenderer({ canvas })).toThrow(/2D context/);
    });
});

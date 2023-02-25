import { WritablePart } from "../types/WritablePart";

export function styleCanvas(style: Partial<WritablePart<CanvasRenderingContext2D | Path2D>>, context: CanvasRenderingContext2D | Path2D): CanvasRenderingContext2D | Path2D {
    let k: keyof Partial<WritablePart<CanvasRenderingContext2D | Path2D>>;
    for (k in style) {
        if (!style.hasOwnProperty(k))
            continue;

        const value = style[k];

        if (!value || typeof value === 'function')
            continue;

        context[k] = value;
    }
    return context;
}

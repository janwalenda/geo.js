import { WritablePart } from "./WritablePart";

export type StyleProps = Partial<WritablePart<CanvasRenderingContext2D | Path2D>>;
export type Style = Partial<CanvasRenderingContext2D | Path2D>;
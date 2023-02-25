import { Style } from "../types";

export interface SineWaveOptions {
    x: number;
    y: number;
    r: number;
    resolution: number;
    rotation: number;
    frequency: number;
    start: number;
    end: number;
    close: boolean;
    style: Style
}

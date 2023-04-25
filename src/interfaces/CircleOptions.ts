import { Style } from "../types";
export interface CircleOptions {
    resolution: number;
    x: number;
    y: number;
    r: number;
    start?: number;
    end?: number;
    rotation: number;
    close?: boolean;
    style: Style
};

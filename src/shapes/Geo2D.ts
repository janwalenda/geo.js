/* eslint-disable @typescript-eslint/no-explicit-any */
import { Face } from "../classes/Face";
import { Vector2 } from "../helpers/Vector2";
import { Vector3 } from "../helpers/Vector3";
import { CanvasRenderingOptions } from "../types/CanvasRenderingOptions";
import { StyleSheetProps } from "../types/StyleSheetProps";

export class Geo2D {
    protected path: Vector2[] = [];
    protected _x: number;
    protected _y: number;
    public rotation?: number;
    public close: boolean;

    /**
     * 
     */
    private _createCanvasPoint(style: StyleSheetProps, context: CanvasRenderingContext2D) {
        for (const prop in style) {
            if (prop in context) {
                if (typeof context[prop] === "function") {
                    context[prop](style[prop]);
                } else {
                    context[prop] = style[prop];
                }
            }
        }
    }
    public toCanvas?: ({ context, style }: CanvasRenderingOptions) => void;

    constructor(x: number, y: number, rotation?: number, close?: boolean) {
        this._x = x;
        this._y = y;
        this.close = close || false;
        this.rotation = rotation || 0;

        this.toCanvas = ({ context, style }): void => 
        {
            const path = this.path;

            for (const { x, y } of path) {
                    context.beginPath();
                    if (style) {
                        this._createCanvasPoint(style, context);
                    }
                    context.moveTo(x, y);
            }
        }
    }


    // 
    
    // toSVGPath() {
    //     const sin = "";
    //     for (const i = 0, len = this.path.length; i < len; i++) {
    //         const point = this.path[i];
    //         const p = point.firstVector2 ? "M" : "L";
    //         sin += `${p}${point.x} ${point.y} `;
    //     }
    //     return sin;
    // }

    protected _length(): number
    {
        return this.path.length;
    }

    toSVGVector2s() {
        let tmp = "";
        for (const point of this.path) {
            tmp += `${point.x},${point.y} `;
        }
        return tmp;
    }

    randomize() {
        let currentIndex = this.path.length;

        let randomIndex:    number;
        let temporaryValue: Vector2;

        do {
            randomIndex    = Math.floor(Math.random() * currentIndex);
            currentIndex  -= 1;
            temporaryValue = this.path[currentIndex];

            this.path[currentIndex] = this.path[randomIndex];
            this.path[randomIndex]  = temporaryValue;
            
        } while (currentIndex !== 0);
        
        return this;
    }

    translateX(x: number): void
    {
        for (const point of this.path) point.moveX(x);
    }

    translateY(y: number): void
    {
        for (const point of this.path) point.moveY(y);
    }

    each(call: (point: Vector2, index?: number) => void): void 
    {
        for (let i = 0; i <= this.path.length; i++) {
            call(this.path[i], i);
        }
    }

    round(value: number) {
        for (const point of this.path) {
            const x = parseFloat(point.x.toPrecision(value));
            const y = parseFloat(point.y.toPrecision(value));
            point.x = x;
            point.y = y;
        }
        return this;
    }

    getDistance(p1: Vector2, p2: { x: number; y: number; }) {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }

    combine(...geos: Geo2D[]) {
        for (const geo of geos) {
            if (!(geo instanceof Geo2D)) continue;
            const path = geo.path;

            for (let i = 0, len = path.length; i < len; i++)
                this.path.push(path[i]);
        }
        return this;
    }

    toFace(y: number) {
        const conv: Vector3[] = [];
        for (const p of this.path) {
            conv.push(p.toVector3(y));
        }
        return new Face(conv);
    }

    public setRotation(rotation: number, center: any) {
        for (const point of this.path) {
            if (!(point instanceof Vector2)) continue;
            const r = this.getDistance(point, center);
            const theta = rotation * Math.PI;
            point.x = Math.cos(theta) * r;
            point.y = Math.sin(theta) * r;
        }
    }

    toJSON(replacer?: (this: any, key: string, value: any) => any, space?: string | number): string
    {
        return JSON.stringify(Object.assign({}, this), replacer, space);
    }
}
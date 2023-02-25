/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vector2 } from "../classes/Vector";

type IfEquals<X, Y, A, B> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeysOf<T> = {
    [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T];

type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

interface ToCanvasOptions {
    context: CanvasRenderingContext2D;
    style: Partial<CanvasRenderingContext2D | Path2D>;
}

function styleCanvas(style: Partial<WritablePart<CanvasRenderingContext2D | Path2D>>, context: CanvasRenderingContext2D | Path2D): CanvasRenderingContext2D | Path2D {
    let k: keyof Partial<WritablePart<CanvasRenderingContext2D | Path2D>>;
    for(k in style){
        if(!style.hasOwnProperty(k)) continue;

        const value = style[k];

        if(!value || typeof value === 'function') continue;

        context[k] = value;
    }
    return context;
}

function isContext(context: any){
    return context instanceof CanvasRenderingContext2D;
}



export class Geo2D {
    protected path: Vector2[] = [];
    protected _x: number;
    protected _y: number;
    public rotation: number;
    public close: boolean;

    protected _isFirstPoint(path: Vector2[], vector: Vector2): boolean {
        const index = path.indexOf(vector);
        return index === 0;
    }

    public drawCanvas({ context, style }: ToCanvasOptions): void {
        if(!isContext(context)) throw new Error('No Context!')
        if (style) {
            styleCanvas(style, context);
        }
        const path = new Path2D();
        for (const point of this.path) {
            if(this._isFirstPoint(this.path, point)){
                path.moveTo(point.x, point.y);
            } else {
                path.lineTo(point.x, point.y);
            }
        }
        if(this.close) path.closePath();
        context.stroke(path);
    }

    constructor(x: number, y: number, rotation?: number, close?: boolean) {
        this._x = x;
        this._y = y;
        this.close = close || false;

        rotation ??= 0;
        this.rotation = rotation;
    }

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
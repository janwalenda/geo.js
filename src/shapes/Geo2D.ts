/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vector2 } from "../classes/Vector";
import { create } from "../helpers";
import { isContext } from "../helpers/isContext";
import { styleCanvas } from "../helpers/styleCanvas";
import { Style, WritablePart } from "../types";

function stylePath(style: Style, element: SVGPathElement): void {
    let k: keyof Partial<WritablePart<CanvasRenderingContext2D | Path2D>>;

    for(k in style) {
        const value = style[k] as string | number;
        switch(k){
            case "strokeStyle":
                element.setAttributeNS(null, 'stroke', value);
                break;
            case "lineWidth":
                element.setAttributeNS(null, 'stroke-width', value);
                break;
        }
        console.log(k);
    }
}

export class Geo2D {
    protected path: Vector2[] = [];
    protected _x: number;
    protected _y: number;
    protected style: Style;
    public rotation: number;
    public close: boolean;

    private _getPathString(): string {
        const path = this.path;
        let string = '';

        for(const point of path) {
            if(this._isFirstPoint(point)){
                const pointString = `M${point.x},${point.y} `;
                string += pointString;
            } else {
                const pointString = `L${point.x},${point.y} `;
                string += pointString;
            }
        }

        return string;
    }

    protected _isFirstPoint(vector: Vector2): boolean {
        const index = this.path.indexOf(vector);
        return index === 0;
    }

    public drawCanvas(context: CanvasRenderingContext2D): void {
        if(!isContext(context)) throw new Error('No Context!')
        
        styleCanvas(this.style, context);

        const pathstring = this._getPathString();
        const path       = new Path2D(pathstring);

        if(this.close) {
            path.closePath();
        }

        context.stroke(path);
    }

    public drawSVG(svg: SVGElement): void {
        const namespaceURI = 'http://www.w3.org/2000/svg';
        const pathString   = this._getPathString();

        
        const path = create.NS(namespaceURI, {
            element: 'path',
            attrNS: {
                d: pathString,
            }
        }) as SVGPathElement;

        stylePath(this.style, path);
        
        svg.appendChild(path);
    }

    constructor(x: number, y: number, style: Style, rotation?: number, close?: boolean) {
        this._x = x;
        this._y = y;
        this.close = close || false;
        this.style = style;
        
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

    translateX(x: number): void {
        for (const point of this.path) point.moveX(x);
    }

    translateY(y: number): void {
        for (const point of this.path) point.moveY(y);
    }

    each(call: (point: Vector2, index?: number) => void): void {
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
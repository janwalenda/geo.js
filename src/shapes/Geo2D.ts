import { Face } from "../helpers/Face";
import { Vector2 } from "../helpers/Vector2";

export class Geo2D {
    protected path: Vector2[];
    public x: number;
    public y: number;
    public rotation: number;
    public close: boolean;
    constructor(x: number, y: number, rotation?: number, close?: boolean) {
        this.x = x;
        this.y = y;
        this.close = close || false;
        this.rotation = rotation || null;
    }

    subdevide(value) { }
    
    // toSVGPath() {
    //     var sin = "";
    //     for (var i = 0, len = this.path.length; i < len; i++) {
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
        var tmp = "";
        for (var point of this.path) {
            tmp += `${point.x},${point.y} `;
        }
        return tmp;
    }
    randomize() {
        var currentIndex = this.path.length, temporaryValue, randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.path[currentIndex];
            this.path[currentIndex] = this.path[randomIndex];
            this.path[randomIndex] = temporaryValue;
        } while (0 !== currentIndex);
        return this;
    }

    translateX(x: number): void
    {
        for (var point of this.path)
            point.moveX(x);
    }

    translateY(y: number): void
    {
        for (var point of this.path)
            point.moveY(y);
    }

    each(call: (point: Vector2, index?: number) => void): void 
    {
        for (var i = 0; i <= this.path.length; i++){
            call(this.path[i], i);
        }
    }

    fromElement(element) {
        var rect = element.getBoundingClientRect();
        for (var point of this.path) {
            var clone = element.cloneNode(true);
            clone.style.setProperty(
                "transform",
                `translate(${point.x}px, ${point.y}px)`
            );
            element.parentNode.appendChild(clone);
        }
        element.remove();
    }

    round(value) {
        value = value || 1;
        for (let point of this.path) {
            const x = parseFloat(point.x.toPrecision(value));
            const y = parseFloat(point.y.toPrecision(value));
            point.x = x;
            point.y = y;
        }
        return this;
    }

    getDistance(p1, p2) {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }

    combine(...geos: Geo2D[]) {
        for (const geo of geos) {
            if (!(geo instanceof Geo2D)) continue;
            const path = geo.path;

            for (var i = 0, len = path.length; i < len; i++)
                this.path.push(path[i]);
        }
        return this;
    }

    toFace(y) {
        let conv = [];
        for (const p of this.path) {
            conv.push(p.toVector3(y));
        }
        return new Face(conv);
    }
    setRotation(rotation, center) {
        for (let point of this.path) {
            if (!(point instanceof Vector2)) continue;
            const r = this.getDistance(point, center);
            const theta = rotation * Math.PI;
            point.x = Math.cos(theta) * r;
            point.y = Math.sin(theta) * r;
        }
    }
    toCanvas = function({ context, style }: { context: CanvasRenderingContext2D, style: {}}){
        const path = this.path;
        for (var { x, y, close } of path) {
                context.beginPath();
                if (style) {
                    for (var prop in style) {
                        if (prop in context) {
                            if (typeof context[prop] === "function") {
                                context[prop](style[prop]);
                            } else {
                                context[prop] = style[prop];
                            }
                        }
                    }
                }
                context.moveTo(x, y);
        }
    }
    toJSON(replacer?: (this: any, key: string, value: any) => any, space?: string | number): string
    {
        return JSON.stringify(Object.assign({}, this), replacer, space);
    }
}

// Geo.prototype.to3D = function (y, perspective) {
//     let list = [];
//     const geo = new Geo3D(this.x, y, this.y, perspective);
//     for (const point of this.path) {
//         const v = new Vector3(point.x, y, point.y);
//         geo.add(v);
//         list.push(v);
//     }
//     const face = new Face(list);
//     geo.add(face);
//     return geo;
// };
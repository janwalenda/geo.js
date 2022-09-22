import { Face } from "../helpers/Face.js";
import { Vector2 } from "../helpers/Vector2.js";
import { Path } from "./Path.js";

export class Geo2D {
    constructor(x, y, rotate, close) {
        this.path = new Array();
        this.x = parseFloat(x || 0);
        this.y = parseFloat(y || 0);
        this.rotate = rotate || null;
        this.close = close || false;
    }
    subdevide(value) { }
    toSVGPath() {
        var sin = "";
        for (var i = 0, len = this.path.length; i < len; i++) {
            const point = this.path[i];
            const p = point.firstVector2 ? "M" : "L";
            sin += `${p}${point.x} ${point.y} `;
        }
        return sin;
    }
    get length() {
        return this.path.length;
    }
    get center() {
        return new Vector2();
    }

    toSVGVector2s() {
        var tmp = "";
        for (var point of this.path) {
            tmp += `${point.x},${point.y} `;
        }
        return tmp;
    }
    get randomize() {
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
    set translateX(x) {
        for (var point of this.path)
            point.moveX = x;
    }
    set translateY(y) {
        for (var point of this.path)
            point.moveY = y;
    }
    each(call) {
        for (var i = 0; i <= this.path.length; i++)
            call(this.points[i], i);
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
        for (var point of this.path) {
            point.x = point.x.toPrecision(value);
            point.y = point.y.toPrecision(value);
        }
        return this;
    }
    getDistance(p1, p2) {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
    combine(...geos) {
        for (var geo of geos) {
            if (!geo instanceof Geo)
                continue;
            var path = geo.path;
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
    setRotate(rotate, center) {
        for (var point of this.path) {
            if (!point instanceof Vector2)
                continue;
            var r = this.getDistance(point, center);
            var theta = rotate * Math.PI;
            point.x = Math.cos(theta) * r;
            point.y = Math.sin(theta) * r;
        }
    }
    toCanvas({ context, style }) {
        const path = this.path instanceof Path ? this.path.path : this.path;
        for (var { x, y, firstVector2, lastVector2, close } of path) {
            if (firstVector2) {
                context.beginPath();
                if (style) {
                    for (var prop in style) {
                        if (prop in context) {
                            if (typeof context[prop] === "funtion") {
                                context[prop](style[prop]);
                            } else {
                                context[prop] = style[prop];
                            }
                        }
                    }
                }
                context.moveTo(x, y);
            } else if (lastVector2) {
                context.lineTo(x, y);
                if (close)
                    context.closePath();
                context.stroke();
            } else {
                context.lineTo(x, y);
            }
        }
    }
    toJSON(...ops) {
        return JSON.stringify(Object.assign({}, this), ...ops);
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
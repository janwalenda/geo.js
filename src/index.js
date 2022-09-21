import { Face } from "./helpers/Face";
import { Geo } from "./shapes/Geo";
import { Geo3D } from "./figues/Geo3D";
import { Matrix3 } from "./helpers/Matrix3";
import { SineWave } from "./shapes/SineWave";
import { Vector2 } from "./helpers/Vector2";
import { Vector3 } from "./helpers/Vector3";

/**
 * @author Jan Walenda
 **/
URL.stringToURL = (string, type) => `data:${type};base64,${btoa(string)}`;
function download(url, filename) {
    var a = document.createElement("a");
    a.download = filename || Date.now();
    a.href = url;
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
}

CanvasRenderingContext2D.prototype.style = function (style) {
    if (style) {
        for (var prop in style) {
            if (prop in this) {
                if (typeof this[prop] === "funtion") {
                    this[prop](style[prop]);
                } else {
                    this[prop] = style[prop];
                }
            }
        }
    }
}

Vector3.cross = function (v1 = new Vector3(), v2 = new Vector3()) {
    if (v1 instanceof Vector3 && v2 instanceof Vector3) {
        var x = v1.y * v2.z - v1.z * v2.y;
        var y = v1.z * v2.x - v1.x * v2.z;
        var z = v1.x * v2.y - v1.y * v2.x;
        return new Vector3(x, y, z);
    }
};

Vector3.dot = function (v1 = new Vector3(), v2 = new Vector3()) {
    if (v1 instanceof Vector3 && v2 instanceof Vector3) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
};

export class Vertex extends Vector3 {

}

export class Position3D extends Vector3 {
    constructor(x = new Number(), y = new Number(), z = new Number()) {
        super(x, y, z);
    }
    set setX(x) {
        this.x = x;
    }
    set setY(y) {
        this.y = y;
    }
    set setZ(z) {
        this.z = z;
    }
    toVector3() {
        return new Vector3(this.x, this.y, this.z);
    }
    toObject(object = Geo3D, options = {}) {
        options = Object.assign(options, this)
        return new object(options);
    }
}

Matrix3.rotate = function (angle = 0, x = 0, y = 0, z = 0) {
    var result = new Matrix3();
    result.setIdentity();

    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var omc = 1 - cos;

    result.data[0 + 0 * 3] = x * omc + cos;
    result.data[0 + 1 * 3] = y * x * omc + z * sin;
    result.data[0 + 2 * 3] = x * z * omc - y * sin;

    result.data[1 + 0 * 3] = x * y * omc - z * sin;
    result.data[1 + 1 * 3] = y * omc + cos;
    result.data[1 + 2 * 3] = y * z * omc + x * sin;

    result.data[2 + 0 * 3] = x * z * omc + y * sin;
    result.data[2 + 1 * 3] = y * z * omc - x * sin;
    result.data[2 + 2 * 3] = z * omc + cos;

    return result;
};


export class Circle extends Geo {
    constructor({ resolution, x, y, r, start, end, rotate, close }) {
        super(x, y, rotate, close);
        this.resolution = resolution || 1;
        this.r = r || 0;
        this.rotate = rotate || 180;
        this.start = start || 0;
        this.end = end || 361;
        for (var i = this.start; i < this.end; i += this.resolution) {
            var p = new Vector2(
                this.x + Math.cos((i * Math.PI) / 180) * this.r,
                this.y + Math.sin((i * Math.PI) / 180) * this.r,
                0,
                i === 0,
                i === this.end - 1
            );
            this.path.push(p);
        }
    }
}

SineWave.yFromI = (x = new Number(), y = new Number(), i = new Number(), r = new Number(), f = new Number()) => {
    return (y || 0) + Math.sin((i * Math.PI * f + x) / 180) * r;
}

Geo.prototype.to3D = function (y, perspective) {
    let list = [];
    const geo = new Geo3D(this.x, y, this.y, perspective);
    for (const point of this.path) {
        const v = new Vector3(point.x, y, point.y);
        geo.add(v);
        list.push(v);
    }
    const face = new Face(list);
    geo.add(face);
    return geo;
};

Document.prototype.create = function ({ element = new String() || new HTMLElement(), css = {}, attr = {}, children = new Array() }) {
    element = element instanceof HTMLElement ? element : typeof element === 'string' ? document.createElement(element) : null;
    if (css) {
        for (var key in css) {
            element.style.setProperty(key, css[key]);
        }
    }
    if (attr) {
        for (var key in attr) {
            element.setAttribute(key, attr[key]);
        }
    }
    for (var key in arguments[0]) {
        if (key in element) element[key] = arguments[0][key];
    }
    if (children) {
        for (var child of children) {
            child = this.create(child);
            element.appendChild(child);
        }
    }
    return element;
};

Document.prototype.createNS = function ({ ns = new String(), element = new String() || new SVGElement(), css = {}, attr = {}, children = new Array() }) {
    element = element instanceof HTMLElement ? element : typeof element === 'string' ? document.createNSElement(ns, element) : null;
    if (css) {
        for (var key in css) {
            element.style.setProperty(key, css[key]);
        }
    }
    if (attr) {
        for (var key in attr) {
            element.setAttribute(key, attr[key]);
        }
    }
    if (attrNS) {
        for (var key in attrNS) {
            element.setAttributeNS(null, key, attrNS[key]);
        }
    }
    for (var key in arguments[0]) {
        if (key in element) element[key] = arguments[0][key];
    }
    if (children) {
        for (var child of children) {
            child = this.createNS(ns, child);
            element.appendChild(child);
        }
    }
    return element;
};


// ((w = new Window(), d = new Document()) => {
//     var canvas = d.create({
//         element: "canvas",
//         width: 2000,
//         height: 2000,
//         css: {
//             width: "100%"
//         }
//     });
//     d.body.appendChild(canvas);
//     var ctx = canvas.getContext("2d");

//     const square = new Square({
//         x: 0,
//         y: 500,
//         z: 0,
//         sizeX: 100,
//         sizeY: 300,
//         sizeZ: 500,
//         perspective: true
//     });
//     /*
//     const circle = new Circle({
//       resolution: 30,
//       x: 0,
//       y: 0,
//       r: 100
//     }).to3D(500, true);
//     */

//     const sphere = new IcoSphere({
//         scale: 500,
//         perspective: false,
//     });
//     sphere.translateY = 500;
//     function step(timestamp) {
//         ctx.fillStyle = "#ff22ff55";
//         ctx.clearRect(0, 0, 2000, 2000);
//         ctx.fillRect(0, 0, 2000, 2000);
//         var tx = (Math.sin(timestamp * (Math.PI / 180)) + 70) * .0001
//         console.log(tx)
//         square.rotate(tx, 0);

//         square.toCanvas(ctx, {
//             fillStyle: "#ff66ff2s",
//             strokeStyle: "#000000"
//         });
//         ctx.stroke();
//         ctx.style({
//             font: '50px serif',
//             fillStyle: '#000000',
//         })
//         ctx.fillText(tx, 780, 1300),

//             w.requestAnimationFrame(step);
//     }

//     canvas.onclick = function () {
//         if (this.requestFullscreen) {
//             this.requestFullscreen();
//         }
//     };
//     w.requestAnimationFrame(step);
// })(window, document);
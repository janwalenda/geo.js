/**
 * @author Jan Walenda
 * @license MIT
 **/

import { Face } from "./helpers/Face";
import { Geo } from "./shapes/Geo";
import { Geo3D } from "./figues/Geo3D";
import { Matrix3 } from "./helpers/Matrix3";
import { SineWave } from "./shapes/SineWave";
import { Vector3 } from "./helpers/Vector3";

/**
 * @function URL.stringToURL()
 * @param {*} string 
 * @param {*} type 
 * @returns {string} url
 */
URL.stringToURL = (string, type) => `data:${type};base64,${btoa(string)}`;

/**
 * Creates style from Object
 * @param {{}} style 
 * @returns {void} No Return
 */
CanvasRenderingContext2D.prototype.style = function(style) {
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
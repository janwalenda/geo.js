"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geo2D = void 0;
var Face_1 = require("../helpers/Face");
var Vector2_1 = require("../helpers/Vector2");
var Geo2D = /** @class */ (function () {
    function Geo2D(x, y, rotation, close) {
        this.toCanvas = function (_a) {
            var context = _a.context, style = _a.style;
            var path = this.path;
            for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
                var _b = path_1[_i], x = _b.x, y = _b.y, close = _b.close;
                context.beginPath();
                if (style) {
                    for (var prop in style) {
                        if (prop in context) {
                            if (typeof context[prop] === "function") {
                                context[prop](style[prop]);
                            }
                            else {
                                context[prop] = style[prop];
                            }
                        }
                    }
                }
                context.moveTo(x, y);
            }
        };
        this.x = x;
        this.y = y;
        this.close = close || false;
        this.rotation = rotation || null;
    }
    Geo2D.prototype.subdevide = function (value) { };
    // toSVGPath() {
    //     const sin = "";
    //     for (const i = 0, len = this.path.length; i < len; i++) {
    //         const point = this.path[i];
    //         const p = point.firstVector2 ? "M" : "L";
    //         sin += `${p}${point.x} ${point.y} `;
    //     }
    //     return sin;
    // }
    Geo2D.prototype._length = function () {
        return this.path.length;
    };
    Geo2D.prototype.toSVGVector2s = function () {
        var tmp = "";
        for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
            var point = _a[_i];
            tmp += "".concat(point.x, ",").concat(point.y, " ");
        }
        return tmp;
    };
    Geo2D.prototype.randomize = function () {
        var currentIndex = this.path.length, temporaryValue, randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.path[currentIndex];
            this.path[currentIndex] = this.path[randomIndex];
            this.path[randomIndex] = temporaryValue;
        } while (0 !== currentIndex);
        return this;
    };
    Geo2D.prototype.translateX = function (x) {
        for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
            var point = _a[_i];
            point.moveX(x);
        }
    };
    Geo2D.prototype.translateY = function (y) {
        for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
            var point = _a[_i];
            point.moveY(y);
        }
    };
    Geo2D.prototype.each = function (call) {
        for (var i = 0; i <= this.path.length; i++) {
            call(this.path[i], i);
        }
    };
    Geo2D.prototype.round = function (value) {
        value = value || 1;
        for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
            var point = _a[_i];
            var x = parseFloat(point.x.toPrecision(value));
            var y = parseFloat(point.y.toPrecision(value));
            point.x = x;
            point.y = y;
        }
        return this;
    };
    Geo2D.prototype.getDistance = function (p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
    };
    Geo2D.prototype.combine = function () {
        var geos = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            geos[_i] = arguments[_i];
        }
        for (var _a = 0, geos_1 = geos; _a < geos_1.length; _a++) {
            var geo = geos_1[_a];
            if (!(geo instanceof Geo2D))
                continue;
            var path = geo.path;
            for (var i = 0, len = path.length; i < len; i++)
                this.path.push(path[i]);
        }
        return this;
    };
    Geo2D.prototype.toFace = function (y) {
        var conv = [];
        for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
            var p = _a[_i];
            conv.push(p.toVector3(y));
        }
        return new Face_1.Face(conv);
    };
    Geo2D.prototype.setRotation = function (rotation, center) {
        for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
            var point = _a[_i];
            if (!(point instanceof Vector2_1.Vector2))
                continue;
            var r = this.getDistance(point, center);
            var theta = rotation * Math.PI;
            point.x = Math.cos(theta) * r;
            point.y = Math.sin(theta) * r;
        }
    };
    Geo2D.prototype.toJSON = function (replacer, space) {
        return JSON.stringify(Object.assign({}, this), replacer, space);
    };
    return Geo2D;
}());
exports.Geo2D = Geo2D;
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

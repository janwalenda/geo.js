"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geo3D = void 0;
var Geo2D_1 = require("../shapes/Geo2D");
var project_1 = require("../functions/project");
var Geo3D = /** @class */ (function (_super) {
    __extends(Geo3D, _super);
    function Geo3D(x, y, z, perspective) {
        var _this = _super.call(this, x, y) || this;
        delete _this.toCanvas;
        delete _this.path;
        _this.z = z;
        _this.perspective = perspective;
        return _this;
    }
    Geo3D.prototype.translateZ = function (z) {
        for (var _i = 0, _a = this.faces; _i < _a.length; _i++) {
            var face = _a[_i];
            for (var _b = 0, _c = face.vertices; _b < _c.length; _b++) {
                var vertex = _c[_b];
                vertex.z += z;
            }
        }
    };
    Geo3D.prototype.translateX = function (x) {
        for (var _i = 0, _a = this.faces; _i < _a.length; _i++) {
            var face = _a[_i];
            for (var _b = 0, _c = face.vertices; _b < _c.length; _b++) {
                var vertex = _c[_b];
                vertex.x += x;
            }
        }
    };
    Geo3D.prototype.translateY = function (y) {
        for (var _i = 0, _a = this.faces; _i < _a.length; _i++) {
            var face = _a[_i];
            for (var _b = 0, _c = face.vertices; _b < _c.length; _b++) {
                var vertex = _c[_b];
                vertex.y += y;
            }
        }
    };
    Geo3D.prototype.rotate = function (theta, phi) {
        // Rotation matrix coefficients
        for (var _i = 0, _a = this.vertices; _i < _a.length; _i++) {
            var M = _a[_i];
            var ct = Math.cos(theta);
            var st = Math.sin(theta);
            var cp = Math.cos(phi);
            var sp = Math.sin(phi);
            // Rotation
            var x = M.x - this.x;
            var y = M.y - this.y;
            var z = M.z - this.z;
            M.x = ct * x - st * cp * y + st * sp * z + this.x;
            M.y = st * x + ct * cp * y - ct * sp * z + this.y;
            M.z = sp * y + cp * z + this.z;
        }
        return this;
    };
    Geo3D.prototype.toCanvas3D = function (ctx, distance, style) {
        var dx = ctx.canvas.width / 2, dy = ctx.canvas.height / 2;
        if (style) {
            for (var prop in style) {
                if (prop in ctx) {
                    if (typeof ctx[prop] === "function") {
                        ctx[prop](style[prop]);
                    }
                    else {
                        ctx[prop] = style[prop];
                    }
                }
            }
        }
        for (var j = 0, n_faces = this.faces.length; j < n_faces; ++j) {
            var face = this.faces[j].vertices;
            var P = (0, project_1.Project)(face[0], this.perspective, distance);
            var path = new Path2D();
            path.moveTo(P.x + dx, -P.y + dy);
            for (var k = 1, n_vertices = face.length; k < n_vertices; ++k) {
                P = (0, project_1.Project)(face[k], this.perspective, distance);
                path.lineTo(P.x + dx, -P.y + dy);
            }
            path.closePath();
            ctx.fill(path);
            ctx.stroke(path);
        }
    };
    return Geo3D;
}(Geo2D_1.Geo2D));
exports.Geo3D = Geo3D;

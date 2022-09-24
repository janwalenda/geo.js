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
exports.Triangle = void 0;
var Face_1 = require("./Face");
var Matrix3_1 = require("./Matrix3");
var Vector3_1 = require("./Vector3");
var Triangle = /** @class */ (function (_super) {
    __extends(Triangle, _super);
    function Triangle(pos1, pos2, pos3, scale) {
        var _this = _super.call(this, new Array()) || this;
        _this.pos1 = pos1.normalize().multiply(scale);
        _this.pos2 = pos2.normalize().multiply(scale);
        _this.pos3 = pos3.normalize().multiply(scale);
        _this.scale = scale;
        var v1 = _this.pos1.clone().subtract(_this.pos2);
        var v2 = _this.pos3.clone().subtract(_this.pos2);
        _this.avg = _this.pos1.clone().add(_this.pos2).add(_this.pos3).divide(3);
        _this.normal = Vector3_1.Vector3.cross(v2, v1);
        _this.normal.normalize();
        _this.vertices = [_this.pos1, _this.pos2, _this.pos3];
        return _this;
    }
    /**
     * @todo Find out whats the problem
     */
    Triangle.prototype.rotate = function (x, y, z) {
        var rotX = Matrix3_1.Matrix3.rotate(x, 1, 0, 0);
        var rotY = Matrix3_1.Matrix3.rotate(y, 0, 1, 0);
        var rotZ = Matrix3_1.Matrix3.rotate(z, 0, 0, 1);
        var rot = rotZ.multiplyMatrix(rotY.multiplyMatrix(rotX));
        this.pos1 = rot.multiplyVector3(this.pos1);
        this.pos2 = rot.multiplyVector3(this.pos2);
        this.pos3 = rot.multiplyVector3(this.pos3);
        this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);
        var v1 = this.pos1.clone().subtract(this.pos2);
        var v2 = this.pos3.clone().subtract(this.pos2);
        this.normal = Vector3_1.Vector3.cross(v2, v1);
        this.normal.normalize();
    };
    Triangle.prototype.subdivide = function () {
        var v12 = new Vector3_1.Vector3(0, 0, 0);
        var v23 = new Vector3_1.Vector3(0, 0, 0);
        var v31 = new Vector3_1.Vector3(0, 0, 0);
        var prop = ["x", "y", "z"];
        for (var i = 0; i < 3; i++) {
            var p = prop[i];
            v12[p] = this.pos1[p] + this.pos2[p];
            v23[p] = this.pos2[p] + this.pos3[p];
            v31[p] = this.pos3[p] + this.pos1[p];
        }
        v12.normalize().multiply(this.scale);
        v23.normalize().multiply(this.scale);
        v31.normalize().multiply(this.scale);
        return [
            new Triangle(this.pos1, v12, v31, this.scale),
            new Triangle(this.pos2, v23, v12, this.scale),
            new Triangle(this.pos3, v31, v23, this.scale),
            new Triangle(v12, v23, v31, this.scale)
        ];
    };
    return Triangle;
}(Face_1.Face));
exports.Triangle = Triangle;

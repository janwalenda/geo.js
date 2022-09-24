"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matrix3 = void 0;
var Vector3_1 = require("./Vector3");
var Matrix3 = /** @class */ (function () {
    function Matrix3() {
        this.data = [];
        for (var i = 0; i < 9; i++) {
            this.data[i] = 0;
        }
    }
    Matrix3.prototype.setIdentity = function () {
        this.data[0 + 0 * 3] = 1;
        this.data[1 + 1 * 3] = 1;
        this.data[2 + 2 * 3] = 1;
    };
    Matrix3.prototype.multiplyVector3 = function (v) {
        if (v instanceof Vector3_1.Vector3) {
            var x = this.data[0 + 0 * 3] * v.x +
                this.data[1 + 0 * 3] * v.y +
                this.data[2 + 0 * 3] * v.z;
            var y = this.data[0 + 1 * 3] * v.x +
                this.data[1 + 1 * 3] * v.y +
                this.data[2 + 1 * 3] * v.z;
            var z = this.data[0 + 2 * 3] * v.x +
                this.data[1 + 2 * 3] * v.y +
                this.data[2 + 2 * 3] * v.z;
            return new Vector3_1.Vector3(x, y, z);
        }
    };
    Matrix3.prototype.multiplyMatrix = function (mat) {
        if (mat instanceof Matrix3) {
            var result = new Matrix3();
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    var sum = 0;
                    for (var e = 0; e < 3; e++) {
                        sum += this.data[y + e * 3] * mat.data[e + x * 3];
                    }
                    result.data[y + x * 3] = sum;
                }
            }
            return result;
        }
    };
    Matrix3.rotate = function (angle, x, y, z) {
        if (angle === void 0) { angle = 0; }
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
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
    ;
    return Matrix3;
}());
exports.Matrix3 = Matrix3;

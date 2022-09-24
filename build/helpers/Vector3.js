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
exports.Vector3 = void 0;
var Vector2_1 = require("./Vector2");
var Vector3 = /** @class */ (function (_super) {
    __extends(Vector3, _super);
    function Vector3(x, y, z) {
        var _this = _super.call(this, x, y) || this;
        _this.z = z;
        return _this;
    }
    Vector3.prototype.midVector2 = function (B) {
        return new Vector3(B.x - this.x, B.y - this.y, B.z - this.z);
    };
    Vector3.prototype.distance = function (B) {
        return Math.sqrt(Math.pow(B.x - this.x, 2) + Math.pow(B.y - this.y, 2) + Math.pow(B.z - this.z, 2));
    };
    Vector3.prototype.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    Vector3.prototype.add = function (v) {
        if (v instanceof Vector3) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        }
        return this;
    };
    Vector3.prototype.subtract = function (v) {
        if (v instanceof Vector3) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        }
        return this;
    };
    Vector3.prototype.multiply = function (n) {
        if (n === void 0) { n = 0; }
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    };
    Vector3.prototype.divide = function (n) {
        if (n === void 0) { n = 0; }
        if (n != 0) {
            this.multiply(1 / n);
        }
        return this;
    };
    Vector3.prototype.clone = function () {
        return new Vector3(this.x, this.y, this.z);
    };
    Vector3.prototype.normalize = function () {
        this.divide(this.mag());
        return this;
    };
    /**
     *
     * @param {Vector3} v1
     * @param {Vector3} v2
     * @returns {Vector3} Cross of two vectors
     */
    Vector3.cross = function (v1, v2) {
        var x = v1.y * v2.z - v1.z * v2.y;
        var y = v1.z * v2.x - v1.x * v2.z;
        var z = v1.x * v2.y - v1.y * v2.x;
        return new Vector3(x, y, z);
    };
    /**
     *
     * @param {Vector3} v1
     * @param {Vector3} v2
     * @returns
     */
    Vector3.dot = function (v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    };
    return Vector3;
}(Vector2_1.Vector2));
exports.Vector3 = Vector3;

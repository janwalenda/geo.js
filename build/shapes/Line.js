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
exports.Line = void 0;
var Geo2D_1 = require("./Geo2D");
var Vector2_1 = require("../helpers/Vector2");
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(_a) {
        var x = _a.x, y = _a.y, width = _a.width, rotation = _a.rotation;
        var _this = _super.call(this, x, y, rotation, false) || this;
        _this.width = width || 0;
        _this.hw = _this.width / 2;
        _this.theta = (_this.rotation * Math.PI) / 180;
        _this.path = [_this._getA(), _this._getB()];
        return _this;
    }
    Line.prototype._getA = function () {
        var x = this.x - this.hw, y = this.y;
        return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x, Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y, false);
    };
    Line.prototype._getB = function () {
        var x = this.x + this.hw, y = this.y;
        return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x, Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y, false);
    };
    return Line;
}(Geo2D_1.Geo2D));
exports.Line = Line;

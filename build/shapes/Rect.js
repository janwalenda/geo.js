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
define(["require", "exports", "./Geo2D", "../helpers/Vector2"], function (require, exports, Geo2D_1, Vector2_1) {
    "use strict";
    exports.__esModule = true;
    exports.Rect = void 0;
    var Rect = /** @class */ (function (_super) {
        __extends(Rect, _super);
        function Rect(_a) {
            var width = _a.width, height = _a.height, x = _a.x, y = _a.y, rotation = _a.rotation, close = _a.close;
            var _this = _super.call(this, x, y, rotation, close) || this;
            _this.width = width || 0;
            _this.height = height || 0;
            _this.halfWidth = _this.width / 2;
            _this.halfHeight = _this.height / 2;
            _this.theta = (_this.rotation * Math.PI) / 180;
            _this.path = [
                _this._getA(),
                _this._getB(),
                _this._getC(),
                _this._getD()
            ];
            if (_this.close)
                _this.path[_this._length() - 1].close = _this.close;
            return _this;
        }
        Rect.prototype._getA = function () {
            var x = this.x - this.halfWidth, y = this.y - this.halfHeight;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y);
        };
        Rect.prototype._getB = function () {
            var x = this.x + this.halfWidth, y = this.y - this.halfHeight;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y);
        };
        Rect.prototype._getC = function () {
            var x = this.x + this.halfWidth, y = this.y + this.halfHeight;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y);
        };
        Rect.prototype._getD = function () {
            var x = this.x - this.halfWidth, y = this.y + this.halfHeight;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y);
        };
        return Rect;
    }(Geo2D_1.Geo2D));
    exports.Rect = Rect;
});

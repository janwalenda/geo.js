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
    exports.Circle = void 0;
    var Circle = /** @class */ (function (_super) {
        __extends(Circle, _super);
        function Circle(_a) {
            var resolution = _a.resolution, x = _a.x, y = _a.y, r = _a.r, start = _a.start, end = _a.end, rotation = _a.rotation, close = _a.close;
            var _this = _super.call(this, x, y, rotation, close) || this;
            _this.resolution = resolution || 1;
            _this.r = r || 0;
            _this.rotation = rotation || 180;
            _this.start = start || 0;
            _this.end = end || 361;
            _this._create();
            return _this;
        }
        Circle.prototype._create = function () {
            for (var i = this.start; i < this.end; i += this.resolution) {
                var x = this.x + Math.cos((i * Math.PI) / 180) * this.r;
                var y = this.y + Math.sin((i * Math.PI) / 180) * this.r;
                var p = new Vector2_1.Vector2(x, y, false);
                this.path.push(p);
            }
        };
        return Circle;
    }(Geo2D_1.Geo2D));
    exports.Circle = Circle;
});

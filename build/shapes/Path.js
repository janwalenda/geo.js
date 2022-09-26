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
    exports.Path = void 0;
    var Path = /** @class */ (function (_super) {
        __extends(Path, _super);
        function Path() {
            var points = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                points[_i] = arguments[_i];
            }
            var _this = _super.call(this, 0, 0, 0, false) || this;
            for (var i = 0, len = points.length; i < len; i++) {
                _this.path.push(Vector2_1.Vector2.fromObject(points[i]));
            }
            return _this;
        }
        Path.prototype.addVector2 = function (point) {
            this.path.push(point);
        };
        return Path;
    }(Geo2D_1.Geo2D));
    exports.Path = Path;
});

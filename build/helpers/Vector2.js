define(["require", "exports", "./Vector3"], function (require, exports, Vector3_1) {
    "use strict";
    exports.__esModule = true;
    exports.Vector2 = void 0;
    var Vector2 = /** @class */ (function () {
        function Vector2(x, y, close) {
            this.x = x;
            this.y = y;
            this.close = close || false;
        }
        Vector2.fromObject = function (_a) {
            var x = _a.x, y = _a.y, close = _a.close;
            return new Vector2(x, y, close);
        };
        Vector2.prototype.moveX = function (x) {
            this.x += x;
        };
        Vector2.prototype.moveY = function (y) {
            this.y += y;
        };
        Vector2.prototype.toVector3 = function (y) {
            return new Vector3_1.Vector3(this.x, y, this.y);
        };
        return Vector2;
    }());
    exports.Vector2 = Vector2;
});

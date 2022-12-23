define(["require", "exports", "./Vector3"], function (require, exports, Vector3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vector2 = void 0;
    class Vector2 {
        x;
        y;
        close;
        constructor(x, y, close) {
            this.x = x;
            this.y = y;
            this.close = close || false;
        }
        static fromObject({ x, y, close }) {
            return new Vector2(x, y, close);
        }
        moveX(x) {
            this.x += x;
        }
        moveY(y) {
            this.y += y;
        }
        toVector3(y) {
            return new Vector3_1.Vector3(this.x, y, this.y);
        }
    }
    exports.Vector2 = Vector2;
});

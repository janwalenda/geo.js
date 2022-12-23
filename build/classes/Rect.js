define(["require", "exports", "./Geo2D", "../helpers/Vector2"], function (require, exports, Geo2D_1, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Rect = void 0;
    class Rect extends Geo2D_1.Geo2D {
        width;
        height;
        halfWidth;
        halfHeight;
        theta;
        constructor({ width, height, x, y, rotation, close }) {
            super(x, y, rotation, close);
            this.width = width || 0;
            this.height = height || 0;
            this.halfWidth = this.width / 2;
            this.halfHeight = this.height / 2;
            this.theta = (this.rotation * Math.PI) / 180;
            this.path = [
                this._getA(),
                this._getB(),
                this._getC(),
                this._getD()
            ];
            if (this.close)
                this.path[this._length() - 1].close = this.close;
        }
        _getA() {
            const x = this.x - this.halfWidth, y = this.y - this.halfHeight;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y);
        }
        _getB() {
            const x = this.x + this.halfWidth, y = this.y - this.halfHeight;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y);
        }
        _getC() {
            const x = this.x + this.halfWidth, y = this.y + this.halfHeight;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y);
        }
        _getD() {
            const x = this.x - this.halfWidth, y = this.y + this.halfHeight;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y);
        }
    }
    exports.Rect = Rect;
});

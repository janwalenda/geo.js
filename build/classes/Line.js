define(["require", "exports", "./Geo2D", "../helpers/Vector2"], function (require, exports, Geo2D_1, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Line = void 0;
    class Line extends Geo2D_1.Geo2D {
        width;
        hw;
        theta;
        constructor({ x, y, width, rotation }) {
            super(x, y, rotation, false);
            this.width = width || 0;
            this.hw = this.width / 2;
            this.theta = (this.rotation * Math.PI) / 180;
            this.path = [this._getA(), this._getB()];
        }
        _getA() {
            const x = this.x - this.hw, y = this.y;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y, false);
        }
        _getB() {
            const x = this.x + this.hw, y = this.y;
            return new Vector2_1.Vector2(Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x, Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y, false);
        }
    }
    exports.Line = Line;
});

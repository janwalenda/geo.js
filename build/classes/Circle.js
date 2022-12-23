define(["require", "exports", "./Geo2D", "../helpers/Vector2"], function (require, exports, Geo2D_1, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Circle = void 0;
    class Circle extends Geo2D_1.Geo2D {
        resolution;
        r;
        start;
        end;
        _create() {
            for (let i = this.start; i < this.end; i += this.resolution) {
                const x = this.x + Math.cos((i * Math.PI) / 180) * this.r;
                const y = this.y + Math.sin((i * Math.PI) / 180) * this.r;
                const p = new Vector2_1.Vector2(x, y, false);
                this.path.push(p);
            }
        }
        constructor({ resolution, x, y, r, start, end, rotation, close }) {
            super(x, y, rotation, close);
            this.resolution = resolution || 1;
            this.r = r || 0;
            this.rotation = rotation || 180;
            this.start = start || 0;
            this.end = end || 361;
            this._create();
        }
    }
    exports.Circle = Circle;
});

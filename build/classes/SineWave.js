define(["require", "exports", "./Geo2D", "../helpers/Vector2"], function (require, exports, Geo2D_1, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SineWave = void 0;
    class SineWave extends Geo2D_1.Geo2D {
        start;
        end;
        resolution;
        frequency;
        r;
        _create() {
            for (let i = this.start; i < this.end; i += this.resolution) {
                const x = i;
                const y = this.y +
                    Math.sin((i * Math.PI * this.frequency + this.x) / 180) * this.r;
                this.path.push(new Vector2_1.Vector2(x, y, false));
            }
        }
        constructor(options) {
            super(options.x, options.y, options.rotation, options.close);
            this.start = options.start || 0;
            this.end = options.end || 360;
            this.resolution = options.resolution || 1;
            this.frequency = options.frequency || 1;
            this.r = options.r;
            this._create();
            if (this.close)
                this.path[this._length() - 1].close = this.close;
        }
        static yFromI = (x, y, i, r, f) => {
            return (y || 0) + Math.sin((i * Math.PI * f + x) / 180) * r;
        };
    }
    exports.SineWave = SineWave;
});

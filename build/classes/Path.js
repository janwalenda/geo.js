define(["require", "exports", "./Geo2D", "../helpers/Vector2"], function (require, exports, Geo2D_1, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Path = void 0;
    class Path extends Geo2D_1.Geo2D {
        constructor(...points) {
            super(0, 0, 0, false);
            for (let i = 0, len = points.length; i < len; i++) {
                this.path.push(Vector2_1.Vector2.fromObject(points[i]));
            }
        }
        addVector2(point) {
            this.path.push(point);
        }
    }
    exports.Path = Path;
});

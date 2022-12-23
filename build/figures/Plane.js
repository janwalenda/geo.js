define(["require", "exports", "./Square"], function (require, exports, Square_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Plane = void 0;
    class Plane extends Square_1.Square {
        constructor({ x, y, z, sizeX, sizeY, sizeZ, perspective }) {
            super({
                x: x,
                y: y,
                z: z,
                sizeX: sizeX,
                sizeY: 0,
                sizeZ: sizeZ,
                perspective: perspective
            });
            this.faces = [this.faces[0]];
        }
    }
    exports.Plane = Plane;
});

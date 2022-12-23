define(["require", "exports", "../helpers/Face", "./Geo3D", "../helpers/Vector3"], function (require, exports, Face_1, Geo3D_1, Vector3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Square = void 0;
    class Square extends Geo3D_1.Geo3D {
        constructor({ x, y, z, sizeX, sizeY, sizeZ, perspective }) {
            super(x, y, z, perspective);
            const dx = sizeX / 2;
            const dy = sizeY / 2;
            const dz = sizeZ / 2;
            this.vertices = [
                new Vector3_1.Vector3(x - dx, y - dy, z + dz),
                new Vector3_1.Vector3(x - dx, y - dy, z - dz),
                new Vector3_1.Vector3(x + dx, y - dy, z - dz),
                new Vector3_1.Vector3(x + dx, y - dy, z + dz),
                new Vector3_1.Vector3(x + dx, y + dy, z + dz),
                new Vector3_1.Vector3(x + dx, y + dy, z - dz),
                new Vector3_1.Vector3(x - dx, y + dy, z - dz),
                new Vector3_1.Vector3(x - dx, y + dy, z + dz)
            ];
            this.faces = [
                new Face_1.Face([
                    this.vertices[0],
                    this.vertices[1],
                    this.vertices[2],
                    this.vertices[3]
                ]),
                new Face_1.Face([
                    this.vertices[3],
                    this.vertices[2],
                    this.vertices[5],
                    this.vertices[4]
                ]),
                new Face_1.Face([
                    this.vertices[4],
                    this.vertices[5],
                    this.vertices[6],
                    this.vertices[7]
                ]),
                new Face_1.Face([
                    this.vertices[7],
                    this.vertices[6],
                    this.vertices[1],
                    this.vertices[0]
                ]),
                new Face_1.Face([
                    this.vertices[7],
                    this.vertices[0],
                    this.vertices[3],
                    this.vertices[4]
                ]),
                new Face_1.Face([
                    this.vertices[1],
                    this.vertices[6],
                    this.vertices[5],
                    this.vertices[2]
                ])
            ];
        }
    }
    exports.Square = Square;
});

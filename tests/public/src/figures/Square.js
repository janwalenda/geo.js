import { Face } from "../helpers/Face.js";
import { Geo3D } from "./Geo3D.js";
import { Vector3 } from "../helpers/Vector3.js";

export class Square extends Geo3D {
    constructor({ x, y, z, sizeX, sizeY, sizeZ, perspective }) {
        super(x, y, z, perspective);
        const dx = sizeX / 2;
        const dy = sizeY / 2;
        const dz = sizeZ / 2;
        this.vertices = [
            new Vector3(x - dx, y - dy, z + dz),
            new Vector3(x - dx, y - dy, z - dz),
            new Vector3(x + dx, y - dy, z - dz),
            new Vector3(x + dx, y - dy, z + dz),
            new Vector3(x + dx, y + dy, z + dz),
            new Vector3(x + dx, y + dy, z - dz),
            new Vector3(x - dx, y + dy, z - dz),
            new Vector3(x - dx, y + dy, z + dz)
        ];
        this.faces = [
            new Face([
                this.vertices[0],
                this.vertices[1],
                this.vertices[2],
                this.vertices[3]
            ]),
            new Face([
                this.vertices[3],
                this.vertices[2],
                this.vertices[5],
                this.vertices[4]
            ]),
            new Face([
                this.vertices[4],
                this.vertices[5],
                this.vertices[6],
                this.vertices[7]
            ]),
            new Face([
                this.vertices[7],
                this.vertices[6],
                this.vertices[1],
                this.vertices[0]
            ]),
            new Face([
                this.vertices[7],
                this.vertices[0],
                this.vertices[3],
                this.vertices[4]
            ]),
            new Face([
                this.vertices[1],
                this.vertices[6],
                this.vertices[5],
                this.vertices[2]
            ])
        ];
    }
}

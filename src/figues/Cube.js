import { Face } from "../helpers/Face";
import { Geo3D } from "./Geo3D";
import { Vector3 } from "../helpers/Vector3";

export class Cube extends Geo3D {
    constructor({ x = new Number(), y = new Number(), z = new Number(), size = new Number(), perspective = new Boolean() }) {
        super(x, y, z, perspective);

        const d = size / 2;
        this.vertices = [
            new Vector3(x - d, y - d, z + d),
            new Vector3(x - d, y - d, z - d),
            new Vector3(x + d, y - d, z - d),
            new Vector3(x + d, y - d, z + d),
            new Vector3(x + d, y + d, z + d),
            new Vector3(x + d, y + d, z - d),
            new Vector3(x - d, y + d, z - d),
            new Vector3(x - d, y + d, z + d)
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

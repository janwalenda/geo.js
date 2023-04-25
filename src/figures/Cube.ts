import { Face } from "../classes/Face";
import { Geo3D } from "./Geo3D";
import { Vector3 } from "../classes/Vector";

interface CubeOption{ 
    x: number, 
    y: number, 
    z: number, 
    size: number, 
    perspective: boolean, 
}
export class Cube extends Geo3D {
    constructor({ x, y, z, size, perspective }: CubeOption) {
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

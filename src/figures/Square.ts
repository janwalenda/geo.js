import { Face } from "../classes/Face";
import { Geo3D } from "./Geo3D";
import { Vector3 } from "../classes/Vector";

export class Square extends Geo3D {
    constructor({ x, y, z, sizeX, sizeY, sizeZ }: {
        x: number;
        y: number;
        z: number;
        sizeX: number;
        sizeY: number;
        sizeZ: number;
    }) {
        super(x, y, z);
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
            new Face([0, 1, 2, 3]),
            new Face([3, 2, 5, 4]),
            new Face([4, 5, 6, 7]),
            new Face([7, 6, 1, 0]),
            new Face([7, 0, 3, 4]),
            new Face([1 ,6 ,5 ,2])
        ];
    }
}

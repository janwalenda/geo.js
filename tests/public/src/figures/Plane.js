import { Square } from "./Square.js";

export class Plane extends Square {
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

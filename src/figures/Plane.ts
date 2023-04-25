import { Square } from "./Square";

export class Plane extends Square {
    constructor({ x, y, z, sizeX, sizeZ, perspective }: {
        x: number;
        y: number;
        z: number;
        sizeX: number;
        sizeZ: number;
        perspective: boolean;
    }) {
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

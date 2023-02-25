import { Geo3D } from "./Geo3D";
import { Vector3 } from "../classes/Vector";

interface UVSphereOptions {
    x: number;
    y: number;
    z: number;
    radius: number;
    widthSegments: number;
    heightSegments: number;
    perspective: boolean;
}

export class UVSphere extends Geo3D {
    constructor({ x, y, z, radius, widthSegments, heightSegments, perspective }: UVSphereOptions) {
        super(x, y, z, perspective);

        const phiLength = Math.PI * 2;
        const thetaStart = 0;
        const thetaLength = Math.PI
        const phiStart = 0;

        widthSegments = Math.max(3, Math.floor(widthSegments || 32));
        heightSegments = Math.max(2, Math.floor(heightSegments || 16));

        for (let iy = 0; iy <= heightSegments; iy++) {
            const v = iy / heightSegments;

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;
                const xCos = Math.cos(phiStart + u * phiLength);
                const xSin = Math.sin(thetaStart + v * thetaLength);
                const x = -radius * xCos * xSin;
                const yCos = Math.cos(thetaStart + v * thetaLength);
                const y = radius * yCos;
                const zCos = Math.sin(phiStart + u * phiLength);
                const zSin = Math.sin(thetaStart + v * thetaLength);
                const z = radius * zCos * zSin;

                const vertex = new Vector3(x, y, z);

                this.vertices.push(vertex);
            }
        }
    }
}

import { Face } from "../classes/Face";
import { Geo3D } from "./Geo3D";
import { Vector3 } from "../classes/Vector3";

export class UVSphere extends Geo3D {
    constructor({ x, y, z, radius, widthSegments, heightSegments, perspective }) {
        super(x, y, z, perspective);
        const phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI, phiStart = 0;
        widthSegments = Math.max(3, Math.floor(widthSegments || 32));
        heightSegments = Math.max(2, Math.floor(heightSegments || 16));
        const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

        for (let iy = 0; iy <= heightSegments; iy++) {
            const v = iy / heightSegments;
            const face = new Face([]);
            // special case for the poles
            let uOffset = 0;

            if (iy == 0 && thetaStart == 0) {
                uOffset = 0.5 / widthSegments;
            } else if (iy == heightSegments && thetaEnd == Math.PI) {
                uOffset = -0.5 / widthSegments;
            }

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;
                const vertex = new Vector3(
                    -radius *
                    Math.cos(phiStart + u * phiLength) *
                    Math.sin(thetaStart + v * thetaLength),
                    radius * Math.cos(thetaStart + v * thetaLength),
                    radius *
                    Math.sin(phiStart + u * phiLength) *
                    Math.sin(thetaStart + v * thetaLength)
                );
                // vertex
                radius *
                    Math.sin(phiStart + u * phiLength) *
                    Math.sin(thetaStart + v * thetaLength);

                this.vertices.push(vertex);
            }
        }
    }
}

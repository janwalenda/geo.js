import { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';

/** Rectangle in the XY plane centered at the origin, facing +Z, split into a grid of quads. */
export class PlaneGeometry extends Geometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        const nx = Math.max(1, Math.floor(widthSegments));
        const ny = Math.max(1, Math.floor(heightSegments));
        const vertices: Vec3[] = [];
        const faces: number[][] = [];

        for (let iy = 0; iy <= ny; iy++) {
            for (let ix = 0; ix <= nx; ix++) {
                vertices.push(new Vec3((ix / nx - 0.5) * width, (iy / ny - 0.5) * height, 0));
            }
        }
        const index = (ix: number, iy: number) => iy * (nx + 1) + ix;
        for (let iy = 0; iy < ny; iy++) {
            for (let ix = 0; ix < nx; ix++) {
                faces.push([index(ix, iy), index(ix + 1, iy), index(ix + 1, iy + 1), index(ix, iy + 1)]);
            }
        }
        super(vertices, faces);
    }
}

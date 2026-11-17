import { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';

/**
 * Sphere from latitude/longitude rings (like a globe): quads in the bands and
 * triangles at the poles, which are single shared vertices.
 */
export class UVSphereGeometry extends Geometry {
    constructor(radius = 1, widthSegments = 24, heightSegments = 12) {
        const w = Math.max(3, Math.floor(widthSegments));
        const h = Math.max(2, Math.floor(heightSegments));
        const vertices: Vec3[] = [new Vec3(0, radius, 0)];
        const faces: number[][] = [];

        // Rings 1 … h−1 between the poles, each with w vertices.
        for (let iy = 1; iy < h; iy++) {
            const theta = (iy / h) * Math.PI;
            const y = radius * Math.cos(theta);
            const r = radius * Math.sin(theta);
            for (let ix = 0; ix < w; ix++) {
                const phi = (ix / w) * Math.PI * 2;
                vertices.push(new Vec3(r * Math.cos(phi), y, r * Math.sin(phi)));
            }
        }
        const south = vertices.push(new Vec3(0, -radius, 0)) - 1;
        const ring = (iy: number, ix: number) => 1 + (iy - 1) * w + (ix % w);

        for (let ix = 0; ix < w; ix++) faces.push([0, ring(1, ix + 1), ring(1, ix)]);
        for (let iy = 1; iy < h - 1; iy++) {
            for (let ix = 0; ix < w; ix++) {
                faces.push([ring(iy, ix + 1), ring(iy + 1, ix + 1), ring(iy + 1, ix), ring(iy, ix)]);
            }
        }
        for (let ix = 0; ix < w; ix++) faces.push([south, ring(h - 1, ix), ring(h - 1, ix + 1)]);

        super(vertices, faces);
    }
}

import { Vec2 } from '../math/Vec2';
import { Vec3 } from '../math/Vec3';
import { Geometry } from './Geometry';

/**
 * Sphere from latitude/longitude rings (like a globe): quads in the bands and
 * triangles at the poles, which are single shared vertices. UVs are an equirectangular
 * projection (a world map wraps around it, north at the top).
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

        // Longitude grows counter-clockwise seen from above, i.e. right to left seen from outside.
        const uv = (iy: number, ix: number) => new Vec2(1 - ix / w, iy / h);
        const uvs: Vec2[][] = [];

        for (let ix = 0; ix < w; ix++) {
            faces.push([0, ring(1, ix + 1), ring(1, ix)]);
            uvs.push([uv(0, ix + 0.5), uv(1, ix + 1), uv(1, ix)]);
        }
        for (let iy = 1; iy < h - 1; iy++) {
            for (let ix = 0; ix < w; ix++) {
                faces.push([ring(iy, ix + 1), ring(iy + 1, ix + 1), ring(iy + 1, ix), ring(iy, ix)]);
                uvs.push([uv(iy, ix + 1), uv(iy + 1, ix + 1), uv(iy + 1, ix), uv(iy, ix)]);
            }
        }
        for (let ix = 0; ix < w; ix++) {
            faces.push([south, ring(h - 1, ix), ring(h - 1, ix + 1)]);
            uvs.push([uv(h, ix + 0.5), uv(h - 1, ix), uv(h - 1, ix + 1)]);
        }

        super(vertices, faces, uvs);
    }
}

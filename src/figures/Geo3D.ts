import { Face } from "../classes/Face";
import { project } from "../functions/Project";
import { Vector3 } from "../classes/Vector";
import { Triangle } from "../classes/Triangle";

export class Geo3D {
    protected faces: Face[] | Triangle[] = [];
    protected vertices: Vector3[] = [];
    protected perspective: boolean;
    private _x: number;
    private _y: number;
    private _z: number;

    constructor(x: number, y: number, z: number, perspective: boolean) {
        this._x = x;
        this._y = y;
        this._z = z;
        this.perspective = perspective;
    }

    translateZ(z: number) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.z += z;
            }
        }
    }
    translateX(x: number) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.x += x;
            }
        }
    }
    translateY(y: number) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.y += y;
            }
        }
    }

    public rotate(theta: number, phi: number): this 
    {
        // Rotation matrix coefficients
        for (const M of this.vertices) {
            const ct = Math.cos(theta);
            const st = Math.sin(theta);
            const cp = Math.cos(phi);
            const sp = Math.sin(phi);

            // Rotation
            const x = M.x - this._x;
            const y = M.y - this._y;
            const z = M.z - this._z;

            M.x = ct * x - st * cp * y + st * sp * z + this._x;
            M.y = st * x + ct * cp * y - ct * sp * z + this._y;
            M.z = sp * y + cp * z + this._z;
        }
        return this;
    }

    public drawCanvas(ctx: CanvasRenderingContext2D, distance: number, style: CanvasRenderingContext2D): void 
    {
        const dx = ctx.canvas.width / 2, dy = ctx.canvas.height / 2;
        if (style) {
            let k: keyof CanvasRenderingContext2D;
            for (k in style) {
                Object.defineProperty(ctx, k, {
                    value: style[k],
                })
            }
        }

        for (let j = 0, n_faces = this.faces.length; j < n_faces; ++j) {
            const face = this.faces[j].vertices;
            let P = project(face[0], this.perspective, distance);
            const path = new Path2D();
            path.moveTo(P.x + dx, -P.y + dy);
            for (let k = 1, n_vertices = face.length; k < n_vertices; ++k) {
                P = project(face[k], this.perspective, distance);
                path.lineTo(P.x + dx, -P.y + dy);
            }
            path.closePath();
            ctx.fill(path);
            ctx.stroke(path);
        }
    }
}

import { Face } from "../helpers/Face";
import { Geo2D } from "../classes/Geo2D";
import { project } from "../functions/project";
import { Vector3 } from "../helpers/Vector3";
import { Triangle } from "../helpers/Triangle";

export class Geo3D extends Geo2D {
    protected faces: Face[] | Triangle[];
    protected vertices: Vector3[];
    protected perspective: boolean;
    public z: number;

    constructor(x: number, y: number, z: number, perspective: boolean) {
        super(x, y);
        if('toCanvas' in this) delete this.toCanvas;
        this.z = z;
        this.perspective = perspective; 


    }

    translateZ(z) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.z += z;
            }
        }
    }
    translateX(x) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.x += x;
            }
        }
    }
    translateY(y) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.y += y;
            }
        }
    }

    public rotate(theta, phi): this 
    {
        // Rotation matrix coefficients
        for (const M of this.vertices) {
            const ct = Math.cos(theta);
            const st = Math.sin(theta);
            const cp = Math.cos(phi);
            const sp = Math.sin(phi);

            // Rotation
            const x = M.x - this.x;
            const y = M.y - this.y;
            const z = M.z - this.z;

            M.x = ct * x - st * cp * y + st * sp * z + this.x;
            M.y = st * x + ct * cp * y - ct * sp * z + this.y;
            M.z = sp * y + cp * z + this.z;
        }
        return this;
    }

    public toCanvas3D(ctx: CanvasRenderingContext2D, distance: number, style: { [property: string]: string }): void 
    {
        const dx = ctx.canvas.width / 2, dy = ctx.canvas.height / 2;
        if (style) {
            for (const prop in style) {
                if (prop in ctx) {
                    if (typeof ctx[prop] === "function") {
                        ctx[prop](style[prop]);
                    } else {
                        ctx[prop] = style[prop];
                    }
                }
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

import { Face } from "../helpers/Face";
import { Geo } from "../shapes/Geo";
import { Project } from "../functions/Project";
import { Vector3 } from "../helpers/Vector3";

export class Geo3D extends Geo {
    faces = new Array();
    vertices = new Array();
    constructor(x = new Number(), y = new Number(), z = new Number(), perspective = new Boolean()) {
        super(x, y);
        delete this.path;
        this.perspective = perspective;
        this.z = parseFloat(z || 0);
    }
    set translateZ(z) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.z += z;
            }
        }
    }
    set translateX(x) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.x += x;
            }
        }
    }
    set translateY(y) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.y += y;
            }
        }
    }
    add(element = new Vector3() || new Face()) {
        if (element instanceof Face) {
            this.faces.push(element);
        } else if (element instanceof Vector3) {
            this.vertices.push(element);
        }
    }
    rotate = function (theta, phi) {
        // Rotation matrix coefficients
        for (var M of this.vertices) {
            var ct = Math.cos(theta);
            var st = Math.sin(theta);
            var cp = Math.cos(phi);
            var sp = Math.sin(phi);

            // Rotation
            var x = M.x - this.x;
            var y = M.y - this.y;
            var z = M.z - this.z;

            M.x = ct * x - st * cp * y + st * sp * z + this.x;
            M.y = st * x + ct * cp * y - ct * sp * z + this.y;
            M.z = sp * y + cp * z + this.z;
        }
        return this;
    };
    toCanvas(ctx, style) {
        const dx = ctx.canvas.width / 2, dy = ctx.canvas.height / 2;
        if (style) {
            for (var prop in style) {
                if (prop in ctx) {
                    if (typeof ctx[prop] === "funtion") {
                        ctx[prop](style[prop]);
                    } else {
                        ctx[prop] = style[prop];
                    }
                }
            }
        }

        for (var j = 0, n_faces = this.faces.length; j < n_faces; ++j) {
            var face = this.faces[j].vertices;
            var P = Project(face[0], this.perspective);
            const path = new Path2D();
            path.moveTo(P.x + dx, -P.y + dy);
            for (var k = 1, n_vertices = face.length; k < n_vertices; ++k) {
                P = Project(face[k], this.perspective);
                path.lineTo(P.x + dx, -P.y + dy);
            }
            path.closePath();
            ctx.fill(path);
            ctx.stroke(path);
        }
    }
}

import { Vector3 } from "./Vector3";
import { Project } from "../functions/Project";

export class Face {
    public vertices: Vector3[];
    public constructor(vertices: Vector3[]) {
        this.vertices = vertices;
    }
    addVector2(vertex) {
        if (!vertex instanceof Vector3)
            throw new Error("vertex must be instanceof Vector");
        this.points.push(point);
    }
    get center() {
        return new Vector3();
    }
    toGeometry() {
        return;
    }
    draw(
        ctx = new CanvasRenderingContext2D(),
        style = new Object(),
        perspective = new Boolean()
    ) {
        var dx = ctx.canvas.width / 2;
        var dy = ctx.canvas.height / 2;
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

        // Draw the first vertex
        var P = Project(this, perspective);
        const path = new Path2D();
        path.moveTo(P.x + dx, -P.y + dy);

        // Draw the other vertices
        for (var k = 1, n_vertices = this.vertices.length; k < n_vertices; ++k) {
            P = Project(this.vertices[k], perspective);
            ctx.lineTo(P.x + dx, -P.y + dy);
        }

        // Close the path and draw the face
        path.closePath();
        ctx.fill(path);
        ctx.stroke(path);
    }
}

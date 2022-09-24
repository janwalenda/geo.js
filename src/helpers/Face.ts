import { Vector3 } from "./Vector3";
import { Project } from "../functions/Project";

export class Face {
    public vertices: Vector3[];
    public constructor(vertices: Vector3[]) {
        this.vertices = vertices;
    }
    addVector2(vertex: Vector3) {
        this.vertices.push(vertex);
    }

    // getCenter() {
    //     return new Vector3();
    // }

    toGeometry() {
        return;
    }
}

import { Vector3 } from "./Vector";

export class Face {
    private _indices: number[];

    get indices(): number[] {
        return this._indices;
    }

    public constructor(vertices: number[]) {
        this._indices = vertices;
    }

    public getVertices(vertices: Vector3[]): Vector3[] {
        return this.indices.map(index => {
            return vertices[index];
        });
    }
}

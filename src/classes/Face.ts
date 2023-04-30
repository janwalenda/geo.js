import { Vector3 } from "./Vector";

export class Face {
    private _indices: number[];

    get indices(): number[] {
        return this._indices;
    }

    public constructor(vertices: number[]) {
        this._indices = vertices;
    }
}

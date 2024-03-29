import { Geo3D } from "./Geo3D";
import { Triangle } from "../classes/Triangle";
import { Vector3 } from "../classes/Vector";

interface IcoSphereOptions {
    scale: number;
    perspective: boolean;
}

export class IcoSphere extends Geo3D {
    private indices: number[][];
    private scale: number;
    private _create(): void
    {
        for (let i = 0; i < this.indices.length; i++) {
            const ind = this.indices[i];
            const vertex0 = this.vertices[ind[0]], vertex1 = this.vertices[ind[1]], vertex2 = this.vertices[ind[2]];

            const triangle = new Triangle(
                new Vector3(vertex0.x, vertex0.y, vertex0.z),
                new Vector3(vertex1.x, vertex1.y, vertex1.z),
                new Vector3(vertex2.x, vertex2.y, vertex2.z),
                this.scale
            );

            this.faces.push(triangle);
        };
        
        let nt: any[] = [];
        for (let i = 0; i < +this.vertices; i++) {
            for (const face of this.faces) {
                if(face instanceof Triangle) nt.push(nt.concat(face.subdivide()));
            }
        }
        this.faces = nt;
    }

    constructor({ scale, perspective }: IcoSphereOptions) {
        super(0, 0, 0, perspective);
        const X = 0.525731112119133606;
        const Z = 0.85065080835203993;
        this.scale = scale;
        this.vertices = [
            new Vector3(-X, 0.0, Z),
            new Vector3(X, 0.0, Z),
            new Vector3(-X, 0.0, -Z),
            new Vector3(X, 0.0, -Z),
            new Vector3(0.0, Z, X),
            new Vector3(0.0, Z, -X),
            new Vector3(0.0, -Z, X),
            new Vector3(0.0, -Z, -X),
            new Vector3(Z, X, 0.0),
            new Vector3(-Z, X, 0.0),
            new Vector3(Z, -X, 0.0),
            new Vector3(-Z, -X, 0.0)
        ];

        this.indices = [
            [0, 4, 1],
            [0, 9, 4],
            [9, 5, 4],
            [4, 5, 8],
            [4, 8, 1],
            [8, 10, 1],
            [8, 3, 10],
            [5, 3, 8],
            [5, 2, 3],
            [2, 7, 3],
            [7, 10, 3],
            [7, 6, 10],
            [7, 11, 6],
            [11, 0, 6],
            [0, 1, 6],
            [6, 1, 10],
            [9, 0, 11],
            [9, 11, 2],
            [9, 2, 5],
            [7, 2, 11]
        ];

        this._create();
    }

}

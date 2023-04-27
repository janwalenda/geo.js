import { Geo3D } from "./Geo3D";
import { Triangle } from "../classes/Triangle";
import { Vector3 } from "../classes/Vector";
import { Face } from "../classes";

interface IcoSphereOptions {
    radius: number;
    perspective: boolean;
}

export class IcoSphere extends Geo3D {
    private radius: number;
    private _create(): void {
        for (let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i];
            const vertex0 = this.vertices[face.indices[0]], vertex1 = this.vertices[face.indices[1]], vertex2 = this.vertices[face.indices[2]];

            const triangle = new Triangle(
                new Vector3(vertex0.x, vertex0.y, vertex0.z),
                new Vector3(vertex1.x, vertex1.y, vertex1.z),
                new Vector3(vertex2.x, vertex2.y, vertex2.z),
                this.radius
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

    constructor({ radius: scale }: IcoSphereOptions) {
        super(0, 0, 0);
        const X = 0.525731112119133606;
        const Z = 0.85065080835203993;
        this.radius = scale;
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

        this.faces = [
            new Face([0, 4, 1]),
            new Face([0, 9, 4]),
            new Face([9, 5, 4]),
            new Face([4, 5, 8]),
            new Face([4, 8, 1]),
            new Face([8, 10, 1]),
            new Face([8, 3, 10]),
            new Face([5, 3, 8]),
            new Face([5, 2, 3]),
            new Face([2, 7, 3]),
            new Face([7, 10, 3]),
            new Face([7, 6, 10]),
            new Face([7, 11, 6]),
            new Face([11, 0, 6]),
            new Face([0, 1, 6]),
            new Face([6, 1, 10]),
            new Face([9, 0, 11]),
            new Face([9, 11, 2]),
            new Face([9, 2, 5]),
            new Face([7, 2, 11])
        ];

        this._create();
    }

}

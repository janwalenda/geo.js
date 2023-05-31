import { Face } from "../classes/Face";
import { Vector3 } from "../classes/Vector";
import { Edge } from "../classes/Edge";

export class Geo3D {
    public faces: Face[] = [];
    public vertices: Vector3[] = [];
    public edges: Edge[] = [];
    protected _x: number;
    protected _y: number;
    protected _z: number;
    protected _position: Vector3;

    public static normalize(vertex: Vector3, radius: number): Vector3 {
        const length = Math.sqrt(vertex.x ** 2 + vertex.y ** 2 + vertex.z ** 2);

        return new Vector3(
            vertex.x / length * radius,
            vertex.y / length * radius,
            vertex.z / length * radius,
        );
    }

    protected _calculateEdges() {

        this.faces.forEach((face) => {
            if (!(face instanceof Face)) return;
            for (let i = 0; i < face.indices.length; i++) {
                const index1 = face.indices[i];
                const index2 = face.indices[(i + 1) % face.indices.length];

                const edge = new Edge(index1, index2);

                let found = false;
                for (let j = 0; j < this.edges.length; j++) {
                    if (edge.equals(this.vertices, this.edges[j])) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    this.edges.push(edge);
                }
            }
        });
    }

    protected _forEdges(callback: (edgle: Edge, v1: Vector3, v2: Vector3, index: number) => void): void {
        for(let i = 0; i < this.edges.length; i++) {
            const edge: Edge = this.edges[i];
            const vector1 = this.vertices[edge.vector1];
            const vector2 = this.vertices[edge.vector2];
            callback(edge, vector1, vector2, i);
        }
    }

    protected _forFaces(callback: (face: Face, indices: number[], index: number) => void): void {
        for(let i = 0; i < this.faces.length; i++) {
            const face: Face = this.faces[i];
            const indices = face.indices;
            callback(face, indices, i);
        }
    }

    protected _forVertices(callback: (vertex: Vector3, index: number) => void): void {
        for(let i = 0; i < this.vertices.length; i++){
            const vertex = this.vertices[i];
            callback(vertex, i);
        }
    }

    protected _vertex(index: number): Vector3 {
        return this.vertices[index];
    }

    constructor(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._position = new Vector3(x, y, z);
    }



    public rotate(angleX: number, angleY: number, angleZ: number): this {
        // Rotation matrix coefficients
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);

        for (let i = 0; i < this.vertices.length; i++) {
            const vertex = this.vertices[i];

            // Rotation um X-Achse
            const y1 = vertex.y * cosX - vertex.z * sinX;
            const z1 = vertex.y * sinX + vertex.z * cosX;

            // Rotation um Y-Achse
            const x2 = vertex.x * cosY - z1 * sinY;
            const z2 = vertex.x * sinY + z1 * cosY;

            // Rotation um Z-Achse
            const x3 = x2 * cosZ - y1 * sinZ;
            const y3 = x2 * sinZ + y1 * cosZ;

            vertex.x = x3;
            vertex.y = y3;
            vertex.z = z2;
        }
        return this;
    }

    simpleSubdivision(iterations: number) {
        for (let i = 0; i < iterations; i++) {
            const newVertices = this.vertices.slice(); // Kopieren Sie die ursprünglichen Eckpunkte in eine neue Array-Variable.
            const newFaces: Face[] = [];
            this._forFaces((face, _, index) => {
                const vertices = face.getVertices(this.vertices);
                console.log(vertices)
            })
        }
    }


    public drawCanvas(
        context: CanvasRenderingContext2D,
    ): void {

        const faces = this.faces;
        const vertices = this.vertices;

        // Zeichnen jedes Dreiecks einzeln auf dem Canvas
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];

            context.beginPath();
            context.moveTo(vertices[face.indices[0]].x, vertices[face.indices[0]].y);

            for (let j = 1; j < face.indices.length; j++) {
                context.lineTo(vertices[face.indices[j]].x, vertices[face.indices[j]].y);
            }

            context.closePath();
            context.stroke();
        }
    }
}

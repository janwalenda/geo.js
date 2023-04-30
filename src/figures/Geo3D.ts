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

                const vector1 = this.vertices[index1];
                const vector2 = this.vertices[index2];

                const edge = new Edge(vector1, vector2);

                let found = false;
                for (let j = 0; j < this.edges.length; j++) {
                    if (edge.equals(this.edges[j])) {
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
        let vertices = this.vertices.slice(); // Kopieren Sie die ursprünglichen Eckpunkte in eine neue Array-Variable.
        let faces = this.faces.slice();
        for (let i = 0; i < iterations; i++) {
            const newVertices = vertices.slice(); // Kopieren Sie die ursprünglichen Eckpunkte in eine neue Array-Variable.
            const newFaces = [];

            for (const edge of this.edges) {
                const v1 = vertices[edge.vector1] // Holen Sie sich die Eckpunkte, die mit diesem Edge verbunden sind.
                const v2 = vertices[edge.vector2]
                const mid = v1.clone().add(v2).multiplyScalar(0.5); // Berechnen Sie den Mittelpunkt des Edges.

                newVertices.push(mid); // Fügen Sie den Mittelpunkt als neuen Eckpunkt hinzu.
                const midIndex = newVertices.length - 1; // Der Index des neuen Eckpunkts.

                for (const face of faces) {
                    const v1Index = face.indices[0];
                    const v2Index = face.indices[1];
                    const v3Index = face.indices[2];

                    if ((
                            v1Index === edge.vector1 && 
                            v2Index === edge.vector2
                        ) || (
                            v1Index === edge.vector2 && 
                            v2Index === edge.vector1
                        )) {

                        // Wenn die beiden Eckpunkte des Edges Teil des ursprünglichen Face sind.
                        // Erstellen Sie zwei neue Faces, indem Sie den Mittelpunkt des Edges mit dem dritten Eckpunkt des ursprünglichen Face verbinden.
                        const face1 = new Face([v1Index, midIndex, v3Index]);
                        const face2 = new Face([midIndex, v2Index, v3Index]);

                        newFaces.push(face1);
                        newFaces.push(face2);
                    } else if ((v2Index === edge.vector1 && v3Index === edge.vector2) || (v2Index === edge.vector2 && v3Index === edge.vector1)) {
                        // Wenn die beiden Eckpunkte des Edges Teil des ursprünglichen Face sind.
                        // Erstellen Sie zwei neue Faces, indem Sie den Mittelpunkt des Edges mit dem ersten Eckpunkt des ursprünglichen Face verbinden.
                        const face1 = new Face([v1Index, midIndex, v2Index]);
                        const face2 = new Face([v1Index, v2Index, midIndex]);

                        newFaces.push(face1);
                        newFaces.push(face2);
                    } else if ((v3Index === edge.vector1 && v1Index === edge.vector2) || (v3Index === edge.vector2 && v1Index === edge.vector1)) {
                        // Wenn die beiden Eckpunkte des Edges Teil des ursprünglichen Face sind.
                        // Erstellen Sie zwei neue Faces, indem Sie den Mittelpunkt des Edges mit dem zweiten Eckpunkt des ursprünglichen Face verbinden.
                        const face1 = new Face([v2Index, midIndex, v1Index]);
                        const face2 = new Face([v2Index, v1Index, midIndex]);

                        newFaces.push(face1);
                        newFaces.push(face2);
                    }
                }
            }
            this.faces = newFaces;
            this.vertices = 
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

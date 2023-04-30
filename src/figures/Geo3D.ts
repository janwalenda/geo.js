import { Face } from "../classes/Face";
import { Vector3 } from "../classes/Vector";
import { Triangle } from "../classes/Triangle";
import { Edge } from "../classes/Edge";

export class Geo3D {
    public faces: Face[] | Triangle[] = [];
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

    protected _getEdges() {
      
        this.faces.forEach((face) => {
            if(!(face instanceof Face)) return;
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

    public subdivide(subdivisions: number): void {
        for (let i = 0; i < subdivisions; i++) {
            const newFaces: Face[] = [];

            for (let j = 0; j < this.faces.length; j++) {
                const face = this.faces[j];

                const v1 = this.vertices[face.indices[0]];
                const v2 = this.vertices[face.indices[1]];
                const v3 = this.vertices[face.indices[2]];

                const v1v2 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
                const v2v3 = { x: v3.x - v2.x, y: v3.y - v2.y, z: v3.z - v2.z };
                const v3v1 = { x: v1.x - v3.x, y: v1.y - v3.y, z: v1.z - v3.z };


                const x = v1.x + v1v2.x / 2 + v3v1.x / 2;
                const y = v1.y + v1v2.y / 2 + v3v1.y / 2;
                const z = v1.z + v1v2.z / 2 + v3v1.z / 2;
                const vertex = new Vector3(x, y, z);

                this.vertices.push(vertex)

                const idx1 = face.indices[0];
                const idx2 = face.indices[1];
                const idx3 = face.indices[2];
                const idx4 = this.vertices.length - 1;

                const face0 = new Face([idx1, idx2, idx4]);
                const face1 = new Face([idx2, idx3, idx4]);
                const face2 = new Face([idx3, idx1, idx4]);
                const face3 = new Face([idx4, idx2, idx1]);

                newFaces.push(face0);
                newFaces.push(face1);
                newFaces.push(face2);
                newFaces.push(face3);
            }

            this.faces.splice(0, this.faces.length);
            this.faces.push(...newFaces);
        }
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

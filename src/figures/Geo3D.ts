import { Face } from "../classes/Face";
import { Vector3 } from "../classes/Vector";
import { Triangle } from "../classes/Triangle";

export class Geo3D {
    protected faces: Face[] | Triangle[] = [];
    protected vertices: Vector3[] = [];
    protected _x: number;
    protected _y: number;
    protected _z: number;

    constructor(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
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
   
import { Geo3D } from "./Geo3D";
import { Vector3 } from "../classes/Vector";
import { Face } from "../classes/Face";

interface SphereOptions {
    x: number;
    y: number;
    z: number;
    radius: number;
    widthSegments?: number;
    heightSegments?: number;
}

export class Sphere extends Geo3D {
    private latitudeSegments: number = 60;
    private longitudeSegments: number = 30;
    private radius: number;

    private _calculateSphereFaces() {
        const faces: Face[] = [];
        const latitudeSegments = this.latitudeSegments;
        const longitudeSegments = this.longitudeSegments;

        for (let lat = 0; lat < latitudeSegments; lat++) {
          for (let long = 0; long < longitudeSegments; long++) {
            const first = lat * (longitudeSegments + 1) + long;
            const second = first + longitudeSegments + 1;

            const face = new Face([
                first, 
                second, 
                first + 1 
            ]);

            const face2 = new Face([
                second, 
                second + 1, 
                first + 1
            ]);
      
            faces.push(face);
            faces.push(face2);
          }
        }
      
        this.faces = faces;
    }

    private _calculateSphereVertices() {

        const latitudeSegments = this.latitudeSegments;
        const longitudeSegments = this.longitudeSegments;
        const radius = this.radius;
      
        for (let lat = 0; lat <= latitudeSegments; lat++) {
          const theta = (lat * Math.PI) / latitudeSegments;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);
      
          for (let long = 0; long <= longitudeSegments; long++) {
            const phi = (long * 2 * Math.PI) / longitudeSegments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
      
            const x = (cosPhi * sinTheta * radius) + this._x;
            const y = (cosTheta * radius) + this._y;
            const z = (sinPhi * sinTheta * radius) + this._z;
            const vector = new Vector3(x, y, z);

            this.vertices.push(vector);
          }
        }
      }

    constructor({ x, y, z, radius, widthSegments = 60, heightSegments = 30  }: SphereOptions) {
        super(x, y, z);
        this.latitudeSegments = widthSegments;
        this.longitudeSegments = heightSegments;
        this.radius = radius;
        this._calculateSphereVertices();
        this._calculateSphereFaces();
    }
}

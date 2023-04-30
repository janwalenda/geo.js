import { Vector3 } from "./Vector";

export class Edge {
    vector1: number;
    vector2: number;
    constructor(v1: number, v2: number) {
      this.vector1 = v1;
      this.vector2 = v2;
    }
  
    equals(vertices: Vector3[], other: Edge): boolean {
        const vector1 = vertices[this.vector1];
        const vector2 = vertices[this.vector2];
        const otherVector1 = vertices[other.vector1];
        const otherVector2 = vertices[other.vector2];
      return (
            vector1.equals(otherVector1) && 
            vector2.equals(otherVector2)
        ) || (
            vector1.equals(otherVector2) && 
            vector2.equals(otherVector1)
        );
    }


}
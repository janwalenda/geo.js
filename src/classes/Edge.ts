import { Vector3 } from "./Vector";

export class Edge {
    vector1: Vector3;
    vector2: Vector3;
    constructor(v1: Vector3, v2: Vector3) {
      this.vector1 = v1;
      this.vector2 = v2;
    }
  
    equals(other: Edge): boolean {
      return (
            this.vector1.equals(other.vector1) && 
            this.vector2.equals(other.vector2)
        ) || (
            this.vector1.equals(other.vector2) && 
            this.vector2.equals(other.vector1)
        );
    }
  }
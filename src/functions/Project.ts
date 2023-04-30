import { Vector3, Vector2 } from "../classes/Vector";

export function project(
    vertex: Vector3, 
    perspective: boolean, 
    distance: number
): Vector2 {
    const d = distance || 400;
    const r = d / vertex.y;
    if (perspective === true) {
        return new Vector2(r * vertex.x, r * vertex.z);
    } else if (perspective === false) {
        return new Vector2(vertex.x, vertex.z);
    } else {
        return new Vector2(r * vertex.x, r * vertex.z);
    }
}

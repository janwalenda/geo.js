import { Vector2 } from "../helpers/Vector2";
import { Vector3 } from "../helpers/Vector3";

export function Project(vertex: Vector3, perspective: boolean, distance: number) {
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

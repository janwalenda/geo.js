import { Vector2 } from "../helpers/Vector2.js";

export function Project(v, perspective, dist) {
    var d = dist || 400;
    var r = d / v.y;
    if (perspective === true) {
        return new Vector2(r * v.x, r * v.z);
    } else if (perspective === false) {
        return new Vector2(v.x, v.z);
    } else {
        return new Vector2(r * v.x, r * v.z);
    }
}

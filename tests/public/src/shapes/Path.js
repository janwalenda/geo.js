import { Geo } from "./Geo2D.js";
import { Vector2 } from "../helpers/Vector2.js";


export class Path extends Geo {
    constructor(...points) {
        super();
        for (var i = 0, len = points.length; i < len; i++) {
            this.path.push(new Vector2().fromObject(points[i]));
        }
    }
    addVector2(point) {
        if (point instanceof Vector2)
            this.path.push(point);
    }
}

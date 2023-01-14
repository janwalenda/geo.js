import { Geo2D } from "./Geo2D";
import { Vector2 } from "../helpers/Vector2";


export class Path extends Geo2D {
    constructor(...points: Vector2[]) {
        super(0, 0, 0, false);
        for (let i = 0, len = points.length; i < len; i++) {
            this.path.push(Vector2.fromObject(points[i]));
        }
    }

    addVector2(point: Vector2): void {
        this.path.push(point);
    }
}

import { Geo3D } from "../figues/Geo3D";
import { Vector3 } from "./Vector3";


export class Position3D extends Vector3 {
    constructor(x = new Number(), y = new Number(), z = new Number()) {
        super(x, y, z);
    }
    set setX(x) {
        this.x = x;
    }
    set setY(y) {
        this.y = y;
    }
    set setZ(z) {
        this.z = z;
    }
    toVector3() {
        return new Vector3(this.x, this.y, this.z);
    }
    toObject(object = Geo3D, options = {}) {
        options = Object.assign(options, this);
        return new object(options);
    }
}

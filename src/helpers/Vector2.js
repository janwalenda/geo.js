import { Vector3 } from "..";

export class Vector2 {
    constructor(x, y, fp, lp, close) {
        this.x = parseFloat(x || 0);
        this.y = parseFloat(y || 0);
        this.firstVector2 = fp || false;
        this.lastVector2 = lp || false;
        this.close = close || false;
    }
    fromObject({ x, y, firstVector2, lastVector2 }) {
        this.x = parseFloat(x || 0);
        this.y = parseFloat(y || 0);
        this.firstVector2 = firstVector2 || false;
        this.lastVector2 = lastVector2 || false;
        return this;
    }

    set moveX(x) {
        this.x += x;
    }
    set moveY(y) {
        this.y += y;
    }
    toVector3(y = new Number()) {
        return new Vector3(this.x, y, this.y);
    }
}

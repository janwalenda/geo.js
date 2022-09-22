import { Geo } from "./Geo.js";
import { Vector2 } from "../helpers/Vector2.js";

export class Line extends Geo {
    constructor({ x, y, width, rotate }) {
        super(x, y);
        this.rotate = rotate || 0;
        this.width = width || 0;
        this.hw = this.width / 2;
        this.theta = (this.rotate * Math.PI) / 180;
        this.path = [this.A, this.B];
    }
    get A() {
        var x = this.x - this.hw, y = this.y;
        return new Vector2(
            Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x,
            Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y,
            0,
            true
        );
    }
    get B() {
        var x = this.x + this.hw, y = this.y;
        return new Vector2().fromObject({
            x: Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x,
            y: Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y,
            lastVector2: true
        });
    }
}

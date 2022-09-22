import { Geo } from "./Geo2D.js";
import { Vector2 } from "../helpers/Vector2.js";

export class Rect extends Geo {
    constructor({ width, height, x, y, rotation, close }) {
        super(x, y, rotation, close);
        this.width = width || 0;
        this.height = height || 0;
        this.hw = this.width / 2;
        this.hh = this.height / 2;
        this.rotation = rotation || 0;
        this.theta = (this.rotation * Math.PI) / 180;
        this.path = [this.A, this.B, this.C, this.D];
        if (this.close)
            this.path[this.length - 1].close = this.close;
    }
    get A() {
        var x = this.x - this.hw, y = this.y - this.hh;
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
        var x = this.x + this.hw, y = this.y - this.hh;
        return new Vector2(
            Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x,
            Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y
        );
    }
    get C() {
        var x = this.x + this.hw, y = this.y + this.hh;
        return new Vector2(
            Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x,
            Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y
        );
    }
    get D() {
        var x = this.x - this.hw, y = this.y + this.hh;
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

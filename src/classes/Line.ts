import { Geo2D } from "./Geo2D";
import { Vector2 } from "../helpers/Vector2";

export class Line extends Geo2D {
    public width: number;
    private hw: number;
    private theta: number;
    constructor({ x, y, width, rotation }) {
        super(x, y, rotation, false);
        this.width = width || 0;
        this.hw = this.width / 2;
        this.theta = (this.rotation * Math.PI) / 180;
        this.path = [this._getA(), this._getB()];
    }
    private _getA() {
        const x = this._x - this.hw, y = this._y;
        return new Vector2(
            Math.cos(this.theta) * (x - this._x) -
            Math.sin(this.theta) * (y - this._y) +
            this._x,
            Math.sin(this.theta) * (x - this._x) +
            Math.cos(this.theta) * (y - this._y) +
            this._y,
            false
        );
    }
    private _getB() {
        const x = this._x + this.hw, y = this._y;
        return new Vector2(
            Math.cos(this.theta) * (x - this._x) -
            Math.sin(this.theta) * (y - this._y) +
            this._x,
            Math.sin(this.theta) * (x - this._x) +
            Math.cos(this.theta) * (y - this._y) +
            this._y,
            false
        );
    }
}

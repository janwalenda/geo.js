import { Geo2D } from "./Geo2D";
import { Vector2 } from "../helpers/Vector2";

export class Rect extends Geo2D{
    public width: number;
    public height: number;
    private halfWidth: number;
    private halfHeight: number;
    private theta: number;


    constructor({ width, height, x, y, rotation, close }) {
        super(x, y, rotation, close);
        this.width = width || 0;
        this.height = height || 0;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        this.theta = (this.rotation! * Math.PI) / 180;
        this.path = [
            this._getA(), 
            this._getB(), 
            this._getC(), 
            this._getD()
        ];
        if (this.close)
            this.path[this._length() - 1].close = this.close;
    }
    private _getA() {
        const x = this._x - this.halfWidth, y = this._y - this.halfHeight;
        return new Vector2(
            Math.cos(this.theta) * (x - this._x) -
            Math.sin(this.theta) * (y - this._y) +
            this._x,
            Math.sin(this.theta) * (x - this._x) +
            Math.cos(this.theta) * (y - this._y) +
            this._y
        );
    }

    private _getB() {
        const x = this._x + this.halfWidth, y = this._y - this.halfHeight;
        return new Vector2(
            Math.cos(this.theta) * (x - this._x) -
            Math.sin(this.theta) * (y - this._y) +
            this._x,
            Math.sin(this.theta) * (x - this._x) +
            Math.cos(this.theta) * (y - this._y) +
            this._y,
        );
    }

    private _getC() {
        const x = this._x + this.halfWidth, y = this._y + this.halfHeight;
        return new Vector2(
            Math.cos(this.theta) * (x - this._x) -
            Math.sin(this.theta) * (y - this._y) +
            this._x,
            Math.sin(this.theta) * (x - this._x) +
            Math.cos(this.theta) * (y - this._y) +
            this._y
        );
    }
    private _getD() {
        const x = this._x - this.halfWidth, y = this._y + this.halfHeight;
        return new Vector2(
            Math.cos(this.theta) * (x - this._x) -
            Math.sin(this.theta) * (y - this._y) +
            this._x,
            Math.sin(this.theta) * (x - this._x) +
            Math.cos(this.theta) * (y - this._y) +
            this._y
        );
    }
}

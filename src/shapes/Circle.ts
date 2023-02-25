import { Geo2D } from "./Geo2D";
import { Vector2 } from "../classes/Vector";
import { CircleOptions } from "../types/CircleOptions";

/**
 * A geometry that represents a Circle
 * @class Circle
 * @extends Geo2D
 * @author Jan Walenda
 * @license (MIT)
 */

export class Circle extends Geo2D {
    public resolution:  number;
    public r:           number;
    public start:      number = 0;
    public end:        number = 360;

    /**
     * Calcs the Path-Array from given information
     */
    private _create(): void
    {
        for (let i = this.start; i < this.end; i += this.resolution) {
            const x     = this._x + Math.cos((i * Math.PI) / 180) * this.r;
            const y     = this._y + Math.sin((i * Math.PI) / 180) * this.r;
            const point = new Vector2(x, y, false);

            this.path.push(point);
        }
    } 

    constructor({ resolution, x, y, r, start, end, rotation, close }: CircleOptions) {
        super(x, y, rotation, close);
        this.resolution = resolution;
        this.r = r || 0;
        this.rotation = rotation;
        this.start = start || 0;
        this.end = end || 361;
        this._create();
    }
}
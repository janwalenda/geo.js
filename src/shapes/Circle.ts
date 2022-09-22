import { Geo2D } from "./Geo2D";
import { Vector2 } from "../helpers/Vector2";



export class Circle extends Geo2D {
    public resolution: number;
    public r: number;
    public start: number;
    public end: number;

    private _create(): void
    {
        for (var i = this.start; i < this.end; i += this.resolution) {
            const x = this.x + Math.cos((i * Math.PI) / 180) * this.r;
            const y = this.y + Math.sin((i * Math.PI) / 180) * this.r;
            const p = new Vector2(x, y, false);
            this.path.push(p);
        }
    } 

    constructor({ resolution, x, y, r, start, end, rotate, close }) {
        super(x, y, rotate, close);
        this.resolution = resolution || 1;
        this.r = r || 0;
        this.rotate = rotate || 180;
        this.start = start || 0;
        this.end = end || 361;
        this._create();
    }
}
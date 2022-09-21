import { Geo } from "./Geo";
import { Vector2 } from "../helpers/Vector2";



export class Circle extends Geo {
    constructor({ resolution, x, y, r, start, end, rotate, close }) {
        super(x, y, rotate, close);
        this.resolution = resolution || 1;
        this.r = r || 0;
        this.rotate = rotate || 180;
        this.start = start || 0;
        this.end = end || 361;
        for (var i = this.start; i < this.end; i += this.resolution) {
            var p = new Vector2(
                this.x + Math.cos((i * Math.PI) / 180) * this.r,
                this.y + Math.sin((i * Math.PI) / 180) * this.r,
                0,
                i === 0,
                i === this.end - 1
            );
            this.path.push(p);
        }
    }
}
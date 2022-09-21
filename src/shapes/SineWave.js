import { Geo } from "./Geo";
import { Vector2 } from "../helpers/Vector2";

export class SineWave extends Geo {
    constructor({ x, y, r, resolution, rotate, frequency, start, end, close }) {
        super(x, y, rotate, close);
        this.start = start || 0;
        this.end = end || 360;
        this.resolution = resolution || 1;
        this.frequency = frequency || 1;
        this.r = r;
        this.sin = "";
        for (var i = this.start; i < this.end; i += this.resolution) {
            var x = i;
            var y = this.y +
                Math.sin((i * Math.PI * this.frequency + this.x) / 180) * this.r;
            this.path.push(new Vector2(x, y, 0, i === 0, i === this.end - 1));
        }
        if (this.close)
            this.path[this.length - 1].close = this.close;
    }
}

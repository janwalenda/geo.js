import { Geo } from "./Geo2D.js";
import { Vector2 } from "../helpers/Vector2.js";

class SineWave extends Geo {
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

SineWave.yFromI = (x = new Number(), y = new Number(), i = new Number(), r = new Number(), f = new Number()) => {
    return (y || 0) + Math.sin((i * Math.PI * f + x) / 180) * r;
}

export { SineWave };
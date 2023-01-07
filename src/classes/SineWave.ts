import { Geo2D } from "./Geo2D";
import { Vector2 } from "../helpers/Vector2";

interface SineWaveOptions{
    x: number;
    y: number;
    r: number;
    resolution: number;
    rotation: number;
    frequency: number;
    start: number;
    end: number;
    close: boolean;
}

class SineWave extends Geo2D {
    public start: number;
    public end: number;
    public resolution: number;
    public frequency: number;
    public r: number;

    private _create(): void
    {
        for (let i: number = this.start; i < this.end; i += this.resolution) {
            const x = i;
            const y = this._y +
                Math.sin((i * Math.PI * this.frequency + this._x) / 180) * this.r;
            this.path.push(new Vector2(x, y, false));
        }
    }

    constructor(options: SineWaveOptions) {
        super(options.x, options.y, options.rotation, options.close);
        this.start      = options.start || 0;
        this.end        = options.end || 360;
        this.resolution = options.resolution || 1;
        this.frequency  = options.frequency || 1;
        this.r          = options.r;
        this._create();
        if (this.close) this.path[this._length() - 1].close = this.close;
    }
    public static yFromI =(x:number, y: number, i: number, r: number, f: number) => {
        return (y || 0) + Math.sin((i * Math.PI * f + x) / 180) * r;
    }
}


export { SineWave };
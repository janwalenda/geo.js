import { Geo3D } from "../figures/Geo3D"
import { Geo2D } from "../shapes/Geo2D"

type Geo = Geo2D | Geo3D;

export class Group{
    private _geos: Geo[] = [];
    constructor(geos: Geo[]){
        this._geos = geos;
    }
    public render(renderer: CanvasRenderingContext2D | SVGElement){
        for(const geo of this._geos){
            if(renderer instanceof CanvasRenderingContext2D){
                if(geo instanceof Geo2D){
                    geo.drawCanvas(renderer);
                }
            } else {
                if(geo instanceof Geo2D){
                    geo.drawSVG(renderer);
                }
            }
        }
    }
}
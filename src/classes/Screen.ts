import { create } from "../helpers";
import { ScreenType } from "../types";

type ScreenElement = HTMLCanvasElement | SVGElement;

interface ScreenOptions {
    width: number;
    height: number;
    resolution: number;
}

export class Screen{
    private _element: ScreenElement;
    
    private _sizeScreen(element: ScreenElement, options: ScreenOptions) {
        const width = options.width * options.resolution;
        const height = options.height * options.resolution;

        if (element instanceof SVGElement) {
            const viewBox = `0 0 ${width} ${height}`;
            element.setAttribute('viewBox', viewBox);
        } else if (element instanceof HTMLCanvasElement) {
            element.width = width;
            element.height = height;
        }
    }

    constructor(type: ScreenType){
        let element: ScreenElement;

        if(type === ScreenType.SVG){
            element = create.NS('http://www.w3.org/2000/svg', {
                element: 'svg',
            }) as SVGElement;
        } else {
            element = create({
                element: 'canvas',
            }) as HTMLCanvasElement;
        } 

        this._element = element;
    }

    get context(){
        if(this._element instanceof HTMLCanvasElement){
            return this._element.getContext('2d');
        } else if(this._element instanceof SVGElement){
            return this._element;
        }
        return null;
    }

    public createScreen(options: ScreenOptions){
        const element = this._element;
        const style = this._element.style;

        style.setProperty('width', `${options.width}px`);
        style.setProperty('height', `${options.height}px`);

        this._sizeScreen(element, options);
        return this;
    }

    public setWidth(width: number){
        const style = this._element.style;
        style.setProperty('width', `${width}px`);
    }

    public getWidth(): number | undefined{
        const box = this._element.getBoundingClientRect();
        return box.width;
    }

    public setHeight(height: number){
        const style = this._element.style;
        style.setProperty('height', `${height}px`);
    }

    public getHeight(){
        const box = this._element.getBoundingClientRect();
        return box.height;
    }
}
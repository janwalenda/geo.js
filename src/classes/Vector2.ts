import { Vector3 } from "./Vector3";


/**
 * A <i>Vector2</i>
 */
export class Vector2 {
    public x:      number;
    public y:      number;
    public close?: boolean;

    constructor(x: number, y: number, close?: boolean) {
        this.x = x;
        this.y = y;
        this.close = close || false;
    }
    public static fromObject({ x, y, close }: Vector2) {
        return new Vector2(x, y, close);
    }

    public moveX(x: number) {
        this.x += x;
    }
    public moveY(y: number) {
        this.y += y;
    }
    
    public toVector3(y: number): Vector3 
    {
        return new Vector3(this.x, y, this.y);
    }
}

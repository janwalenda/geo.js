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
}

class Vector3 extends Vector2 {
    public z: number;
    constructor(x: number, y: number, z: number) {
        super(x, y);
        this.z = z;
    }
    midVector2(B: Vector3): Vector3 
    {
        return new Vector3(B.x - this.x, B.y - this.y, B.z - this.z);
    }

    distance(B: Vector3): number
    {
        return Math.sqrt(
            Math.pow(B.x - this.x, 2) + Math.pow(B.y - this.y, 2) + Math.pow(B.z - this.z, 2)
        );
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    add(v: Vector3) {
        if (v instanceof Vector3) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        }
        return this;
    }
    subtract(v: Vector3) {
        if (v instanceof Vector3) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        }
        return this;
    }
    multiply(n = 0) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }
    divide(n = 0) {
        if (n != 0) {
            this.multiply(1 / n);
        }
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    normalize() {
        this.divide(this.mag());
        return this;
    }

    /**
     * 
     * @param {Vector3} v1 
     * @param {Vector3} v2 
     * @returns {Vector3} Cross of two vectors
     */
    public static cross (v1: Vector3, v2: Vector3): Vector3 
    {

        const x = v1.y * v2.z - v1.z * v2.y;
        const y = v1.z * v2.x - v1.x * v2.z;
        const z = v1.x * v2.y - v1.y * v2.x;
        return new Vector3(x, y, z);
    }

    /**
     * 
     * @param {Vector3} v1 
     * @param {Vector3} v2 
     * @returns 
     */
    public static dot(v1: Vector3, v2: Vector3): number 
    {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

}


 

export { Vector3 };
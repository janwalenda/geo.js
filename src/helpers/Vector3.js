import { Vector2 } from "./Vector2";
import { Geo3D } from "../figues/Geo3D";

class Vector3 extends Vector2 {
    constructor(x = new Number(), y = new Number(), z = new Number()) {
        super(x, y);
        this.z = z;
    }
    midVector2(B = new Vector3()) {
        return new Vector3(B.x - this.x, B.y - this.y, B.z - this.z);
    }
    distance(B) {
        return Math.sqrt(
            Math.pow(B.x - this.x) + Math.pow(B.y - this.y) + Math.pow(B.z - this.z)
        );
    }
    toGeometry(perspective = new Boolean()) {
        perspective && perspective instanceof Boolean
            ? (perspective = perspective)
            : (perspective = true);
        return new Geo3D(
            this.midVector2().x,
            this.midVector2().y,
            this.midVector2().z,
            perspective
        );
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    add(v = new Vector3()) {
        if (v instanceof Vector3) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        }
        return this;
    }
    subtract(v = new Vector3()) {
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
}

/**
 * 
 * @param {Vector3} v1 
 * @param {Vector3} v2 
 * @returns {Vector3} Cross of two vectors
 */
 Vector3.cross = function (v1, v2) {
    if (v1 instanceof Vector3 && v2 instanceof Vector3) {
        var x = v1.y * v2.z - v1.z * v2.y;
        var y = v1.z * v2.x - v1.x * v2.z;
        var z = v1.x * v2.y - v1.y * v2.x;
        return new Vector3(x, y, z);
    }
};

/**
 * 
 * @param {Vector3} v1 
 * @param {Vector3} v2 
 * @returns 
 */
Vector3.dot = function (v1, v2) {
    if (v1 instanceof Vector3 && v2 instanceof Vector3) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
};

export { Vector3 };
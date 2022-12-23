define(["require", "exports", "./Vector2"], function (require, exports, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vector3 = void 0;
    class Vector3 extends Vector2_1.Vector2 {
        z;
        constructor(x, y, z) {
            super(x, y);
            this.z = z;
        }
        midVector2(B) {
            return new Vector3(B.x - this.x, B.y - this.y, B.z - this.z);
        }
        distance(B) {
            return Math.sqrt(Math.pow(B.x - this.x, 2) + Math.pow(B.y - this.y, 2) + Math.pow(B.z - this.z, 2));
        }
        mag() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        add(v) {
            if (v instanceof Vector3) {
                this.x += v.x;
                this.y += v.y;
                this.z += v.z;
            }
            return this;
        }
        subtract(v) {
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
        static cross(v1, v2) {
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
        static dot(v1, v2) {
            return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        }
    }
    exports.Vector3 = Vector3;
});

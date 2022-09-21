import { Vector3 } from "./Vector3";

export class Matrix3 {
    constructor() {
        this.data = [];
        for (var i = 0; i < 9; i++) {
            this.data[i] = 0;
        }
    }
    setIdentity() {
        this.data[0 + 0 * 3] = 1;
        this.data[1 + 1 * 3] = 1;
        this.data[2 + 2 * 3] = 1;
    }
    multiplyVector3(v = new Vector3()) {
        if (v instanceof Vector3) {
            var x = this.data[0 + 0 * 3] * v.x +
                this.data[1 + 0 * 3] * v.y +
                this.data[2 + 0 * 3] * v.z;
            var y = this.data[0 + 1 * 3] * v.x +
                this.data[1 + 1 * 3] * v.y +
                this.data[2 + 1 * 3] * v.z;
            var z = this.data[0 + 2 * 3] * v.x +
                this.data[1 + 2 * 3] * v.y +
                this.data[2 + 2 * 3] * v.z;

            return new Vector3(x, y, z);
        }
    }
    multiplyMatrix(mat = new Matrix3()) {
        if (mat instanceof Matrix3) {
            var result = new Matrix3();
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    var sum = 0;
                    for (var e = 0; e < 3; e++) {
                        sum += this.data[y + e * 3] * mat.data[e + x * 3];
                    }
                    result.data[y + x * 3] = sum;
                }
            }
            return result;
        }
    }
}

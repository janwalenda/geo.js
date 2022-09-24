import { Vector3 } from "./Vector3";

class Matrix3 {
    data = [];
    constructor() {
        for (var i = 0; i < 9; i++) {
            this.data[i] = 0;
        }
    }
    setIdentity() {
        this.data[0 + 0 * 3] = 1;
        this.data[1 + 1 * 3] = 1;
        this.data[2 + 2 * 3] = 1;
    }
    multiplyVector3(v: Vector3) {
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
    multiplyMatrix(mat: Vector3) {
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

    public static rotate(angle = 0, x = 0, y = 0, z = 0) {
        var result = new Matrix3();
        result.setIdentity();
    
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var omc = 1 - cos;
    
        result.data[0 + 0 * 3] = x * omc + cos;
        result.data[0 + 1 * 3] = y * x * omc + z * sin;
        result.data[0 + 2 * 3] = x * z * omc - y * sin;
    
        result.data[1 + 0 * 3] = x * y * omc - z * sin;
        result.data[1 + 1 * 3] = y * omc + cos;
        result.data[1 + 2 * 3] = y * z * omc + x * sin;
    
        result.data[2 + 0 * 3] = x * z * omc + y * sin;
        result.data[2 + 1 * 3] = y * z * omc - x * sin;
        result.data[2 + 2 * 3] = z * omc + cos;
    
        return result;
    };
}

export { Matrix3 };
import { Vector3 } from "./Vector3";

class Matrix3 {
    data: number[] = [];
    constructor() {
        for (let i = 0; i < 9; i++) {
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
            const x = this.data[0 + 0 * 3] * v.x +
                this.data[1 + 0 * 3] * v.y +
                this.data[2 + 0 * 3] * v.z;
            const y = this.data[0 + 1 * 3] * v.x +
                this.data[1 + 1 * 3] * v.y +
                this.data[2 + 1 * 3] * v.z;
            const z = this.data[0 + 2 * 3] * v.x +
                this.data[1 + 2 * 3] * v.y +
                this.data[2 + 2 * 3] * v.z;

            return new Vector3(x, y, z);
        }
    }
    public multiplyMatrix(mat: Matrix3) {
        if (mat instanceof Matrix3) {
            const result = new Matrix3();
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    let sum = 0;
                    for (let e = 0; e < 3; e++) {
                        sum += this.data[y + e * 3] * mat.data[e + x * 3];
                    }
                    result.data[y + x * 3] = sum;
                }
            }
            return result;
        }
    }

    public static rotate(angle = 0, x = 0, y = 0, z = 0) {
        const result = new Matrix3();
        result.setIdentity();
    
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const omc = 1 - cos;
    
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
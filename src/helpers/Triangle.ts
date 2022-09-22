import { Face } from "./Face";
import { Matrix3 } from "./Matrix3";
import { Vector3 } from "./Vector3";

export class Triangle extends Face {
    constructor(pos1 = new Vector3(), pos2 = new Vector3(), pos3 = new Vector3(), scale = new Number()) {
        super(new Array());
        this.pos1 = pos1.normalize().multiply(scale);
        this.pos2 = pos2.normalize().multiply(scale);
        this.pos3 = pos3.normalize().multiply(scale);
        this.scale = scale;
        var v1 = this.pos1.clone().subtract(this.pos2);
        var v2 = this.pos3.clone().subtract(this.pos2);

        this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);

        this.normal = Vector3.cross(v2, v1);
        this.normal.normalize();
        this.vertices = [this.pos1, this.pos2, this.pos3];
    }
    rotate(x = new Number(), y = new Number(), z = new Number()) {
        var rotX = Matrix3.rotate(x, 1, 0, 0);
        var rotY = Matrix3.rotate(y, 0, 1, 0);
        var rotZ = Matrix3.rotate(z, 0, 0, 1);

        var rot = rotZ.multiplyMatrix(rotY.multiplyMatrix(rotX));
        this.pos1 = rot.multiplyVector(this.pos1);
        this.pos2 = rot.multiplyVector(this.pos2);
        this.pos3 = rot.multiplyVector(this.pos3);

        this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);

        var v1 = this.pos1.clone().subtract(this.pos2);
        var v2 = this.pos3.clone().subtract(this.pos2);

        this.normal = Vector3.cross(v2, v1);
        this.normal.normalize();
    }
    subdivide() {
        var v12 = new Vector3(0, 0, 0);
        var v23 = new Vector3(0, 0, 0);
        var v31 = new Vector3(0, 0, 0);

        var prop = ["x", "y", "z"];

        for (var i = 0; i < 3; i++) {
            var p = prop[i];
            v12[p] = this.pos1[p] + this.pos2[p];
            v23[p] = this.pos2[p] + this.pos3[p];
            v31[p] = this.pos3[p] + this.pos1[p];
        }

        v12.normalize().multiply(this.scale);
        v23.normalize().multiply(this.scale);
        v31.normalize().multiply(this.scale);

        return [
            new Triangle(this.pos1, v12, v31, this.scale),
            new Triangle(this.pos2, v23, v12, this.scale),
            new Triangle(this.pos3, v31, v23, this.scale),
            new Triangle(v12, v23, v31, this.scale)
        ];
    }
}

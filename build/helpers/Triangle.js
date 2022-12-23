define(["require", "exports", "./Face", "./Matrix3", "./Vector3"], function (require, exports, Face_1, Matrix3_1, Vector3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Triangle = void 0;
    class Triangle extends Face_1.Face {
        pos1;
        pos2;
        pos3;
        scale;
        avg;
        normal;
        constructor(pos1, pos2, pos3, scale) {
            super(new Array());
            this.pos1 = pos1.normalize().multiply(scale);
            this.pos2 = pos2.normalize().multiply(scale);
            this.pos3 = pos3.normalize().multiply(scale);
            this.scale = scale;
            const v1 = this.pos1.clone().subtract(this.pos2);
            const v2 = this.pos3.clone().subtract(this.pos2);
            this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);
            this.normal = Vector3_1.Vector3.cross(v2, v1);
            this.normal.normalize();
            this.vertices = [this.pos1, this.pos2, this.pos3];
        }
        /**
         * @todo Find out whats the problem
         */
        rotate(x, y, z) {
            const rotX = Matrix3_1.Matrix3.rotate(x, 1, 0, 0);
            const rotY = Matrix3_1.Matrix3.rotate(y, 0, 1, 0);
            const rotZ = Matrix3_1.Matrix3.rotate(z, 0, 0, 1);
            const rot = rotZ.multiplyMatrix(rotY.multiplyMatrix(rotX));
            this.pos1 = rot?.multiplyVector3(this.pos1);
            this.pos2 = rot?.multiplyVector3(this.pos2);
            this.pos3 = rot?.multiplyVector3(this.pos3);
            this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);
            const v1 = this.pos1.clone().subtract(this.pos2);
            const v2 = this.pos3.clone().subtract(this.pos2);
            this.normal = Vector3_1.Vector3.cross(v2, v1);
            this.normal.normalize();
        }
        subdivide() {
            const v12 = new Vector3_1.Vector3(0, 0, 0);
            const v23 = new Vector3_1.Vector3(0, 0, 0);
            const v31 = new Vector3_1.Vector3(0, 0, 0);
            const prop = ["x", "y", "z"];
            for (let i = 0; i < 3; i++) {
                const p = prop[i];
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
    exports.Triangle = Triangle;
});

import { Face } from "./Face";
import { Matrix3 } from "./Matrix3";
import { Vector3 } from "./Vector3";

export class Triangle extends Face {
    public pos1: Vector3;
    public pos2: Vector3;
    public pos3: Vector3;
    public scale: number;
    public avg: Vector3;
    public normal: Vector3;
    
    constructor(pos1: Vector3, pos2: Vector3, pos3: Vector3, scale: number) {
        super(new Array());
        this.pos1 = pos1.normalize().multiply(scale);
        this.pos2 = pos2.normalize().multiply(scale);
        this.pos3 = pos3.normalize().multiply(scale);
        this.scale = scale;
        const v1 = this.pos1.clone().subtract(this.pos2);
        const v2 = this.pos3.clone().subtract(this.pos2);

        this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);

        this.normal = Vector3.cross(v2, v1);
        this.normal.normalize();
        this.vertices = [this.pos1, this.pos2, this.pos3];
    }

    /**
     * @todo Find out whats the problem
     */
    rotate(x: number, y: number, z: number): void {
        const rotX = Matrix3.rotate(x, 1, 0, 0);
        const rotY = Matrix3.rotate(y, 0, 1, 0);
        const rotZ = Matrix3.rotate(z, 0, 0, 1);

        const rot = rotZ.multiplyMatrix(rotY.multiplyMatrix(rotX)!);
        this.pos1 = rot?.multiplyVector3(this.pos1)!;
        this.pos2 = rot?.multiplyVector3(this.pos2)!;
        this.pos3 = rot?.multiplyVector3(this.pos3)!;

        this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);

        const v1 = this.pos1.clone().subtract(this.pos2);
        const v2 = this.pos3.clone().subtract(this.pos2);

        this.normal = Vector3.cross(v2, v1);
        this.normal.normalize();
    }

    subdivide() {
        const v12 = new Vector3(0, 0, 0);
        const v23 = new Vector3(0, 0, 0);
        const v31 = new Vector3(0, 0, 0);

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

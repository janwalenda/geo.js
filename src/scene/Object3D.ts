import { Mat4 } from '../math/Mat4';
import { Quat, type EulerOrder } from '../math/Quat';
import { Vec3 } from '../math/Vec3';

const UP = new Vec3(0, 1, 0);

/**
 * Node of the scene graph with a local transform (`position`, `rotation`, `scale`).
 * The local matrix is `T · R · S`; the world matrix is `parent.world · local`.
 * An object's forward direction is its local −Z axis.
 */
export class Object3D {
    name = '';
    visible = true;
    parent: Object3D | null = null;
    readonly children: Object3D[] = [];

    readonly position = new Vec3();
    readonly rotation = new Quat();
    readonly scale = new Vec3(1, 1, 1);

    /** Local transform, updated by {@link Object3D.updateMatrix}. */
    readonly matrix = new Mat4();
    /** Transform to world space, updated by {@link Object3D.updateWorldMatrix}. */
    readonly worldMatrix = new Mat4();

    /** Add children (removing them from a previous parent). */
    add(...objects: Object3D[]): this {
        for (const object of objects) {
            if (object === this) throw new Error('geo: an object cannot be its own child');
            object.parent?.remove(object);
            object.parent = this;
            this.children.push(object);
        }
        return this;
    }

    remove(...objects: Object3D[]): this {
        for (const object of objects) {
            const index = this.children.indexOf(object);
            if (index !== -1) {
                this.children.splice(index, 1);
                object.parent = null;
            }
        }
        return this;
    }

    /** Depth-first visit of this object and all descendants. */
    traverse(callback: (object: Object3D) => void): void {
        callback(this);
        for (const child of this.children) child.traverse(callback);
    }

    /** Like {@link Object3D.traverse}, but skips invisible objects and their subtrees. */
    traverseVisible(callback: (object: Object3D) => void): void {
        if (!this.visible) return;
        callback(this);
        for (const child of this.children) child.traverseVisible(callback);
    }

    updateMatrix(): void {
        this.matrix.compose(this.position, this.rotation, this.scale);
    }

    /**
     * Recompute world matrices of this subtree.
     * @param updateParents also refresh the ancestors first (needed if they changed)
     */
    updateWorldMatrix(updateParents = false): void {
        if (updateParents && this.parent) this.parent.updateWorldMatrix(true);
        this.updateMatrix();
        if (this.parent) this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.matrix);
        else this.worldMatrix.copy(this.matrix);
        for (const child of this.children) child.updateWorldMatrix(false);
    }

    /** Set the rotation from Euler angles in radians. */
    setRotationFromEuler(x: number, y: number, z: number, order: EulerOrder = 'XYZ'): this {
        this.rotation.setFromEuler(x, y, z, order);
        return this;
    }

    /** Rotate around a local axis by `angle` radians. */
    rotateOnAxis(axis: Vec3, angle: number): this {
        this.rotation.multiply(new Quat().setFromAxisAngle(axis, angle));
        return this;
    }

    rotateX(angle: number): this {
        return this.rotateOnAxis(new Vec3(1, 0, 0), angle);
    }

    rotateY(angle: number): this {
        return this.rotateOnAxis(new Vec3(0, 1, 0), angle);
    }

    rotateZ(angle: number): this {
        return this.rotateOnAxis(new Vec3(0, 0, 1), angle);
    }

    /** World-space position of this object. */
    getWorldPosition(out = new Vec3()): Vec3 {
        this.updateWorldMatrix(true);
        const e = this.worldMatrix.elements;
        return out.set(e[12], e[13], e[14]);
    }

    /** Rotate so the local −Z axis points at a world-space `target`, keeping `up` roughly +Y. */
    lookAt(target: Vec3, up: Vec3 = UP): this {
        const eye = this.getWorldPosition();
        const rotation = new Mat4().makeLookRotation(eye, target, up);
        this.rotation.setFromRotationMatrix(rotation);
        if (this.parent) {
            const parentRotation = new Quat();
            this.parent.worldMatrix.decompose(new Vec3(), parentRotation, new Vec3());
            this.rotation.premultiply(parentRotation.invert());
        }
        return this;
    }
}

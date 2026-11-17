import { Mat4 } from '../math/Mat4';
import { degToRad } from '../math/utils';
import { Object3D } from './Object3D';

/** Base class of all cameras. A camera looks down its local −Z axis. */
export abstract class Camera extends Object3D {
    /** View → clip space. */
    readonly projectionMatrix = new Mat4();
    /** World → view space (inverse of the world matrix). */
    readonly viewMatrix = new Mat4();

    /**
     * Recompute the projection matrix.
     * @param viewportAspect width / height of the render target, used when no fixed aspect is set
     */
    abstract updateProjectionMatrix(viewportAspect?: number): void;

    /** Refresh world, view and projection matrices. Called by the pipeline before each frame. */
    update(viewportAspect?: number): void {
        this.updateWorldMatrix(true);
        this.viewMatrix.copy(this.worldMatrix).invert();
        this.updateProjectionMatrix(viewportAspect);
    }
}

export interface PerspectiveCameraOptions {
    /** Vertical field of view in **degrees**. Default `50`. */
    fov?: number;
    /** Fixed width / height; leave undefined to follow the renderer's viewport. */
    aspect?: number;
    near?: number;
    far?: number;
}

/** Pinhole camera with perspective foreshortening. */
export class PerspectiveCamera extends Camera {
    fov: number;
    aspect: number | undefined;
    near: number;
    far: number;

    constructor(options: PerspectiveCameraOptions = {}) {
        super();
        this.fov = options.fov ?? 50;
        this.aspect = options.aspect;
        this.near = options.near ?? 0.1;
        this.far = options.far ?? 1000;
    }

    updateProjectionMatrix(viewportAspect = 1): void {
        this.projectionMatrix.makePerspective(degToRad(this.fov), this.aspect ?? viewportAspect, this.near, this.far);
    }
}

export interface OrthographicCameraOptions {
    /** Half of the visible height in world units. Default `1`. */
    size?: number;
    /** Fixed width / height; leave undefined to follow the renderer's viewport. */
    aspect?: number;
    near?: number;
    far?: number;
}

/** Parallel projection without foreshortening (technical drawings, plots). */
export class OrthographicCamera extends Camera {
    size: number;
    aspect: number | undefined;
    near: number;
    far: number;

    constructor(options: OrthographicCameraOptions = {}) {
        super();
        this.size = options.size ?? 1;
        this.aspect = options.aspect;
        this.near = options.near ?? 0.1;
        this.far = options.far ?? 1000;
    }

    updateProjectionMatrix(viewportAspect = 1): void {
        const h = this.size;
        const w = h * (this.aspect ?? viewportAspect);
        this.projectionMatrix.makeOrthographic(-w, w, h, -h, this.near, this.far);
    }
}

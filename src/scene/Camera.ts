import { Mat4 } from '../math/Mat4';
import { Object3D } from './Object3D';

/** Base class of all cameras. A camera looks down its local −Z axis. */
export abstract class Camera extends Object3D {
  /** View → clip space. */
  readonly projectionMatrix = new Mat4();
  /** World → view space (inverse of the world matrix). */
  readonly viewMatrix = new Mat4();
  /** Distance of the near clipping plane (> 0). */
  abstract near: number;
  /** Distance of the far clipping plane. */
  abstract far: number;

  /**
   * Refresh world, view and projection matrices. Called by the pipeline before
   * each frame.
   * @param viewportAspect width / height of the render target
   */
  update(viewportAspect?: number): void {
    this.updateWorldMatrix(true);
    this.viewMatrix.copy(this.worldMatrix).invert();
    this.updateProjectionMatrix(viewportAspect);
  }

  /**
   * Recompute the projection matrix.
   * @param viewportAspect width / height of the render target, used when no
   *   fixed aspect is set
   */
  abstract updateProjectionMatrix(viewportAspect?: number): void;
}

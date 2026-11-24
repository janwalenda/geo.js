import { degToRad } from '../math/utils';
import { Camera } from './Camera';
import type { PerspectiveCameraOptions } from './types';

/** Pinhole camera with perspective foreshortening. */
export class PerspectiveCamera extends Camera {
  /** Vertical field of view in degrees. */
  fov: number;
  /** Fixed width / height, or `undefined` to follow the viewport. */
  aspect: number | undefined;
  override near: number;
  override far: number;

  constructor(options: PerspectiveCameraOptions = {}) {
    super();
    this.fov = options.fov ?? 50;
    this.aspect = options.aspect;
    this.near = options.near ?? 0.1;
    this.far = options.far ?? 1000;
  }

  override updateProjectionMatrix(viewportAspect = 1): void {
    this.projectionMatrix.makePerspective(
      degToRad(this.fov),
      this.aspect ?? viewportAspect,
      this.near,
      this.far,
    );
  }
}

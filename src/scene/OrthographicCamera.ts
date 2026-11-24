import { Camera } from './Camera';
import type { OrthographicCameraOptions } from './types';

/** Parallel projection without foreshortening (technical drawings, plots). */
export class OrthographicCamera extends Camera {
  /** Half of the visible height in world units. */
  size: number;
  /** Fixed width / height, or `undefined` to follow the viewport. */
  aspect: number | undefined;
  override near: number;
  override far: number;

  constructor(options: OrthographicCameraOptions = {}) {
    super();
    this.size = options.size ?? 1;
    this.aspect = options.aspect;
    this.near = options.near ?? 0.1;
    this.far = options.far ?? 1000;
  }

  override updateProjectionMatrix(viewportAspect = 1): void {
    const h = this.size;
    const w = h * (this.aspect ?? viewportAspect);
    this.projectionMatrix.makeOrthographic(-w, w, h, -h, this.near, this.far);
  }
}

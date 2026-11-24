import { Vec3 } from '../math/Vec3';
import { Light } from './Light';
import type { ColorLike } from './types';

/**
 * Parallel light (like the sun) shining from its world position towards
 * `target`.
 */
export class DirectionalLight extends Light {
  readonly target = new Vec3();

  constructor(color: ColorLike = '#ffffff', intensity = 1) {
    super(color, intensity);
    this.position.set(1, 1, 1);
  }

  /**
   * Unit vector pointing from the surface **towards** the light (world
   * space). Written to `out`.
   */
  getDirectionToLight(out = new Vec3()): Vec3 {
    return this.getWorldPosition(out).sub(this.target).normalize();
  }
}

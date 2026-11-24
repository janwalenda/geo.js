import { Light } from './Light';
import type { ColorLike } from './types';

/** Light emitted from a point in all directions, without distance falloff. */
export class PointLight extends Light {
  constructor(color: ColorLike = '#ffffff', intensity = 1) {
    super(color, intensity);
  }
}

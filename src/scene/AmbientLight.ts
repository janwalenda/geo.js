import { Light } from './Light';
import type { ColorLike } from './types';

/** Uniform light from all directions. */
export class AmbientLight extends Light {
  constructor(color: ColorLike = '#ffffff', intensity = 0.3) {
    super(color, intensity);
  }
}

import { Color } from './Color';
import { Object3D } from './Object3D';
import type { ColorLike } from './types';

/** Base class of all lights. */
export abstract class Light extends Object3D {
  color: Color;

  constructor(
    color: ColorLike = '#ffffff',
    public intensity = 1,
  ) {
    super();
    this.color = Color.from(color);
  }
}

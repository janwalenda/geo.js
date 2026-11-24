import { Color } from './Color';
import { Object3D } from './Object3D';
import type { SceneOptions } from './types';

/** Root of a scene graph. */
export class Scene extends Object3D {
  /**
   * Background color painted by the renderers; `null` keeps the surface
   * transparent.
   */
  background: Color | null;

  constructor(options: SceneOptions = {}) {
    super();
    this.name = 'Scene';
    const background = options.background ?? null;
    this.background = background === null ? null : Color.from(background);
  }
}

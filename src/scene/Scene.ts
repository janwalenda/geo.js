import { Color, type ColorLike } from './Color';
import { Object3D } from './Object3D';

/** Root of a scene graph. */
export class Scene extends Object3D {
    /** Background color painted by the renderers; `null` keeps the surface transparent. */
    background: Color | null;

    constructor(options: { background?: ColorLike | null } = {}) {
        super();
        this.name = 'Scene';
        this.background = options.background == null ? null : Color.from(options.background);
    }
}

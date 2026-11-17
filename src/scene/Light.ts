import { Vec3 } from '../math/Vec3';
import { Color, type ColorLike } from './Color';
import { Object3D } from './Object3D';

/** Base class of all lights. */
export abstract class Light extends Object3D {
    color: Color;

    constructor(color: ColorLike = '#ffffff', public intensity = 1) {
        super();
        this.color = Color.from(color);
    }
}

/** Uniform light from all directions. */
export class AmbientLight extends Light {
    constructor(color: ColorLike = '#ffffff', intensity = 0.3) {
        super(color, intensity);
    }
}

/** Parallel light (like the sun) shining from its world position towards `target`. */
export class DirectionalLight extends Light {
    readonly target = new Vec3();

    constructor(color: ColorLike = '#ffffff', intensity = 1) {
        super(color, intensity);
        this.position.set(1, 1, 1);
    }

    /** Unit vector pointing from the surface **towards** the light (world space). */
    getDirectionToLight(out = new Vec3()): Vec3 {
        return this.getWorldPosition(out).sub(this.target).normalize();
    }
}

/** Light emitted from a point in all directions, without distance falloff. */
export class PointLight extends Light {
    constructor(color: ColorLike = '#ffffff', intensity = 1) {
        super(color, intensity);
    }
}

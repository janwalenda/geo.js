import type { Vec3 } from '../math/Vec3';
import { Material } from './Material';
import { Object3D } from './Object3D';

/** Connected line through 3D points (e.g. a curve or an axis). Uses the material's stroke. */
export class Polyline extends Object3D {
    material: Material;

    constructor(
        public points: Vec3[],
        material?: Material,
        /** Connect the last point back to the first. */
        public closed = false,
    ) {
        super();
        this.material = material ?? new Material({ fill: null, stroke: '#000000', lit: false });
    }
}

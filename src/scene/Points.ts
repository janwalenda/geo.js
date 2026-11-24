import type { Vec3 } from '../math/Vec3';
import { Material } from './Material';
import { Object3D } from './Object3D';

/**
 * Point cloud drawn as screen-space circles of `material.pointSize` pixels
 * radius.
 */
export class Points extends Object3D {
  material: Material;

  constructor(
    public positions: Vec3[],
    material?: Material,
  ) {
    super();
    this.material = material ?? new Material({ fill: '#000000', lit: false });
  }
}

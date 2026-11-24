import type { Geometry } from '../geometry/Geometry';
import { Material } from './Material';
import { Object3D } from './Object3D';

/**
 * Polygon mesh placed in the scene. Geometry and material may be shared between
 * meshes.
 */
export class Mesh extends Object3D {
  constructor(
    public geometry: Geometry,
    public material: Material = new Material(),
  ) {
    super();
  }
}

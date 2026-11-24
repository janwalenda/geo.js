import { CylinderGeometry } from './CylinderGeometry';

/** Cone along the Y axis with its apex at +height/2. */
export class ConeGeometry extends CylinderGeometry {
  constructor(radius = 1, height = 1, radialSegments = 24, openEnded = false) {
    super(0, radius, height, radialSegments, openEnded);
  }
}

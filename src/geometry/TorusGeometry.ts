import { Vec3 } from '../math/Vec3';
import { ParametricGeometry } from './ParametricGeometry';

/** Torus lying in the XZ plane around the Y axis. */
export class TorusGeometry extends ParametricGeometry {
    /**
     * @param radius distance from the center to the middle of the tube
     * @param tube radius of the tube
     */
    constructor(radius = 1, tube = 0.4, radialSegments = 12, tubularSegments = 32) {
        super(
            (u, v) => {
                const a = u * Math.PI * 2; // around the tube
                const b = v * Math.PI * 2; // around the ring
                const r = radius + tube * Math.cos(a);
                return new Vec3(r * Math.cos(b), tube * Math.sin(a), r * Math.sin(b));
            },
            { slicesU: radialSegments, slicesV: tubularSegments, closedU: true, closedV: true },
        );
    }
}

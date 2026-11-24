import { Vec2 } from '../math/Vec2';
import type { Vec3 } from '../math/Vec3';
import type { Camera } from '../scene/Camera';
import { Mesh } from '../scene/Mesh';
import type { Object3D } from '../scene/Object3D';
import { Points } from '../scene/Points';
import { Polyline } from '../scene/Polyline';
import { Scene } from '../scene/Scene';
import { compilePoints, compilePolyline } from './compileLines';
import { compileMesh } from './compileMesh';
import { depthOrder } from './depthOrder';
import { flattenGroups } from './output';
import { projectAll } from './projection';
import { collectLights } from './shading';
import type {
  CompileContext,
  CompileOptions,
  CompileOutput,
  DisplayList,
} from './types';

/**
 * Run the pipeline: transform every visible object of `scene` into the view
 * of `camera`, clip at the near plane, project, cull back faces, shade and
 * sort. Pure function of its inputs – no DOM involved.
 */
export function compile(
  scene: Object3D,
  camera: Camera,
  options: CompileOptions,
): DisplayList {
  const { width, height } = options;
  camera.update(width / height);
  scene.updateWorldMatrix(true);
  const ctx: CompileContext = {
    view: camera.viewMatrix,
    projection: camera.projectionMatrix,
    near: camera.near,
    far: camera.far,
    width,
    height,
    seams: options.seams ?? 0.5,
    lights: collectLights(scene),
  };

  const out: CompileOutput = { primitives: [], groups: [] };
  scene.traverseVisible((object) => {
    if (object instanceof Mesh) {
      compileMesh(object, ctx, out);
    } else if (object instanceof Polyline) {
      compilePolyline(object, ctx, out);
    } else if (object instanceof Points) {
      compilePoints(object, ctx, out);
    }
  });

  const primitives =
    options.sort === false
      ? out.primitives
      : flattenGroups(out, depthOrder(out.groups));
  const background =
    scene instanceof Scene && scene.background
      ? scene.background.toCSS()
      : null;
  return { width, height, background, primitives };
}

/**
 * Screen position (CSS pixels) of a world-space point, or `null` if it lies
 * behind the near plane. Useful for labels and hit testing.
 */
export function projectPoint(
  point: Vec3,
  camera: Camera,
  width: number,
  height: number,
): Vec2 | null {
  camera.update(width / height);
  const v = point.clone().applyMat4(camera.viewMatrix);
  if (v.z > -camera.near) {
    return null;
  }
  const projection = camera.projectionMatrix;
  const [x, y] = projectAll([v], { projection, width, height });
  return new Vec2(x, y);
}

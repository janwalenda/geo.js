import { Vec3 } from '../math/Vec3';
import { AmbientLight } from '../scene/AmbientLight';
import { Color } from '../scene/Color';
import { DirectionalLight } from '../scene/DirectionalLight';
import type { Material } from '../scene/Material';
import type { Object3D } from '../scene/Object3D';
import { PointLight } from '../scene/PointLight';
import type { CompileContext, Lights, PrimitiveStyle } from './types';

const BLACK = new Color(0, 0, 0);
const WHITE = new Color(1, 1, 1);

/** Collect the visible lights of `scene` in world space. */
export function collectLights(scene: Object3D): Lights {
  const lights: Lights = {
    any: false,
    ambient: new Color(0, 0, 0),
    directional: [],
    point: [],
  };
  scene.traverseVisible((object) => {
    if (object instanceof AmbientLight) {
      lights.ambient.add(object.color.clone().scale(object.intensity));
    } else if (object instanceof DirectionalLight) {
      lights.directional.push({
        direction: object.getDirectionToLight(),
        color: object.color.clone().scale(object.intensity),
      });
    } else if (object instanceof PointLight) {
      lights.point.push({
        position: object.getWorldPosition(),
        color: object.color.clone().scale(object.intensity),
      });
    } else {
      return;
    }
    lights.any = true;
  });
  return lights;
}

/**
 * Flat Lambert shading. Without any light in the scene the base color is
 * used unchanged.
 */
export function shade(
  base: Color,
  normal: Vec3,
  center: Vec3,
  lights: Lights,
): Color {
  if (!lights.any) {
    return base;
  }
  const light = lights.ambient.clone();
  for (const d of lights.directional) {
    light.add(d.color.clone().scale(Math.max(0, normal.dot(d.direction))));
  }
  const toLight = new Vec3();
  for (const p of lights.point) {
    toLight.copy(p.position).sub(center).normalize();
    light.add(p.color.clone().scale(Math.max(0, normal.dot(toLight))));
  }
  return base.clone().multiply(light).clamp();
}

/**
 * Brightness in [0, 1] of a white surface with this normal: the mean of the
 * shaded color channels.
 */
export function brightness(normal: Vec3, center: Vec3, lights: Lights): number {
  const light = shade(WHITE, normal, center, lights);
  return Math.min(1, (light.r + light.g + light.b) / 3);
}

/** Line color of a wireframe or polyline material. */
export function lineColor(material: Material): string {
  return (material.stroke ?? material.fill ?? BLACK).toCSS();
}

/** Resolved style of a flat (untextured) face. */
export function faceStyle(
  material: Material,
  normal: Vec3,
  center: Vec3,
  ctx: CompileContext,
): PrimitiveStyle {
  const { opacity, lineWidth } = material;
  if (material.wireframe) {
    return { fill: null, stroke: lineColor(material), lineWidth, opacity };
  }
  const base = material.fill;
  const lit =
    base && material.lit ? shade(base, normal, center, ctx.lights) : base;
  const fill = lit ? lit.toCSS() : null;
  const stroke = material.stroke?.toCSS() ?? null;
  if (stroke === null && fill !== null && hidesSeams(material, ctx)) {
    return { fill, stroke: fill, lineWidth: ctx.seams, opacity };
  }
  return { fill, stroke, lineWidth, opacity };
}

/**
 * Whether a face of this material gets a hairline in its fill color: only
 * fully opaque faces, where the overlap cannot show.
 */
function hidesSeams(material: Material, ctx: CompileContext): boolean {
  const alpha = material.fill?.a ?? 0;
  return alpha >= 1 && material.opacity >= 1 && ctx.seams > 0;
}

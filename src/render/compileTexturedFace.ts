import type { Material } from '../scene/Material';
import { projectAll, signedArea } from './projection';
import { brightness } from './shading';
import {
  affineFromTriangle,
  autoTextureDetail,
  inflatePolygon,
  subdivideTriangle,
} from './textureMapping';
import type {
  CompileContext,
  CornerTriangle,
  Primitive,
  TexturePiece,
  VisibleFace,
} from './types';

/**
 * Emit a textured face: fan-triangulate the (near-clipped) polygon, subdivide
 * each triangle against affine distortion and map the texture onto every
 * piece. Lighting is a black overlay over the whole face whose opacity darkens
 * it like flat shading. All pieces share the face depth and are sorted as one
 * group, so they stay together and in order.
 */
export function compileTexturedFace(
  face: VisibleFace,
  material: Material,
  ctx: CompileContext,
  out: Primitive[],
): void {
  if (!material.map) {
    return;
  }
  const piece: TexturePiece = {
    src: material.map.src,
    opacity: material.opacity,
    depth: face.depth,
    inflate: ctx.seams,
  };
  const [first, ...rest] = face.corners;
  for (let k = 0; k < rest.length - 1; k++) {
    const triangle: CornerTriangle = [first, rest[k], rest[k + 1]];
    const detail = textureDetail(material, triangle);
    for (const part of subdivideTriangle(triangle, detail)) {
      pushTexturedTriangle(part, piece, ctx, out);
    }
  }
  out.push(...overlays(face, material, ctx));
}

/** Subdivisions per edge for one triangle of a face. */
function textureDetail(material: Material, triangle: CornerTriangle): number {
  if (material.textureDetail !== 'auto') {
    return Math.max(1, Math.floor(material.textureDetail));
  }
  const distances = triangle.map((corner) => -corner.p.z);
  return autoTextureDetail(Math.min(...distances), Math.max(...distances));
}

/** Map the texture onto one triangle (skipped if it is degenerate). */
function pushTexturedTriangle(
  triangle: CornerTriangle,
  piece: TexturePiece,
  ctx: CompileContext,
  out: Primitive[],
): void {
  const xy = projectAll(
    triangle.map((corner) => corner.p),
    ctx,
  );
  const uv = triangle.flatMap((corner) => [corner.uv.x, corner.uv.y]);
  const transform = affineFromTriangle(uv, xy);
  if (!transform || signedArea(xy) === 0) {
    return;
  }
  out.push({
    type: 'image',
    src: piece.src,
    transform,
    points: inflatePolygon(xy, piece.inflate),
    opacity: piece.opacity,
    depth: piece.depth,
  });
}

/** Lighting overlay and outline drawn on top of the texture pieces. */
function overlays(
  face: VisibleFace,
  material: Material,
  ctx: CompileContext,
): Primitive[] {
  const { points, depth } = face;
  const { opacity } = material;
  const result: Primitive[] = [];
  const light =
    material.lit && ctx.lights.any
      ? brightness(face.normal, face.center, ctx.lights)
      : 1;
  if (light < 0.999) {
    result.push({
      type: 'polygon',
      points: inflatePolygon(points, ctx.seams),
      depth,
      fill: '#000000',
      stroke: null,
      lineWidth: 0,
      opacity: (1 - light) * opacity,
    });
  }
  if (material.stroke) {
    const stroke = material.stroke.toCSS();
    const { lineWidth } = material;
    result.push({
      type: 'polygon',
      points,
      depth,
      fill: null,
      stroke,
      lineWidth,
      opacity,
    });
  }
  return result;
}

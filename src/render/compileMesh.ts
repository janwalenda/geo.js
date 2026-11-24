import { Vec2 } from '../math/Vec2';
import { Vec3 } from '../math/Vec3';
import type { Material } from '../scene/Material';
import type { Mesh } from '../scene/Mesh';
import { clipCornersNear } from './clipping';
import { compileTexturedFace } from './compileTexturedFace';
import { pushGroup } from './output';
import {
  averageDistance,
  centroid,
  newellNormal,
  outsideViewport,
  projectAll,
  signedArea,
} from './projection';
import { faceStyle } from './shading';
import type {
  CompileContext,
  CompileOutput,
  FaceInput,
  VisibleFace,
} from './types';

const ZERO_UV = new Vec2(0, 0);

/** Emit every visible face of `mesh`, one sortable group per face. */
export function compileMesh(
  mesh: Mesh,
  ctx: CompileContext,
  out: CompileOutput,
): void {
  const { geometry, material } = mesh;
  const uvs = material.map && !material.wireframe ? geometry.uvs : null;
  const world = geometry.vertices.map((v) =>
    v.clone().applyMat4(mesh.worldMatrix),
  );
  const view = world.map((v) => v.clone().applyMat4(ctx.view));
  geometry.faces.forEach((face, f) => {
    const input: FaceInput = { world, view, face, uvs: uvs?.[f] };
    const visible = prepareFace(input, material, ctx);
    if (visible) {
      emitFace(visible, material, ctx, out);
    }
  });
}

/**
 * Clip, project and cull one face. Returns `null` if nothing of it is
 * visible.
 */
function prepareFace(
  input: FaceInput,
  material: Material,
  ctx: CompileContext,
): VisibleFace | null {
  const { world, view, face, uvs } = input;
  if (face.length < 3 || face.every((i) => view[i].z < -ctx.far)) {
    return null;
  }
  const normal = newellNormal(world, face, new Vec3());
  if (normal.lengthSq() === 0) {
    return null; // degenerate face
  }
  const corners = clipCornersNear(
    face.map((i, k) => ({ p: view[i], uv: uvs?.[k] ?? ZERO_UV })),
    ctx.near,
  );
  const polygon = corners.map((c) => c.p);
  const points = projectAll(polygon, ctx);
  const front = visibleSide(points, material, ctx);
  if (corners.length < 3 || front === null) {
    return null;
  }
  if (!front) {
    normal.negate(); // light the visible side of double-sided faces
  }
  return {
    corners,
    polygon,
    points,
    normal,
    center: centroid(world, face),
    depth: averageDistance(polygon),
    textured: uvs?.length === face.length,
  };
}

/**
 * `true` if the front of the face is visible, `false` for its back, `null`
 * if the face is culled (off screen, wrong side or edge-on).
 */
function visibleSide(
  points: number[],
  material: Material,
  ctx: CompileContext,
): boolean | null {
  if (points.length < 6 || outsideViewport(points, ctx, material.lineWidth)) {
    return null;
  }
  // NDC is y-up, screen is y-down: front faces (CCW) have a negative area.
  const area = signedArea(points);
  const front = area < 0;
  const edgeOn = area === 0 && !material.stroke && !material.wireframe;
  const wrongSide =
    (material.side === 'front' && !front) ||
    (material.side === 'back' && front);
  return edgeOn || wrongSide ? null : front;
}

/** Push the primitives of one visible face as a sortable group. */
function emitFace(
  face: VisibleFace,
  material: Material,
  ctx: CompileContext,
  out: CompileOutput,
): void {
  const start = out.primitives.length;
  const { points, depth, normal, center } = face;
  if (face.textured && material.map) {
    compileTexturedFace(face, material, ctx, out.primitives);
  } else {
    const style = faceStyle(material, normal, center, ctx);
    out.primitives.push({ type: 'polygon', points, depth, ...style });
  }
  pushGroup(out, start, depth, { polygon: face.polygon, screen: points });
}

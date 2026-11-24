import type { Points } from '../scene/Points';
import type { Polyline } from '../scene/Polyline';
import { clipPathNear } from './clipping';
import { pushGroup } from './output';
import { averageDistance, projectAll } from './projection';
import { lineColor } from './shading';
import type { CompileContext, CompileOutput, PrimitiveStyle } from './types';

/**
 * Emit a polyline, split into separate runs where it crosses the near plane.
 * Every run is its own sortable group.
 */
export function compilePolyline(
  line: Polyline,
  ctx: CompileContext,
  out: CompileOutput,
): void {
  if (line.points.length < 2) {
    return;
  }
  const view = line.points.map((p) =>
    p.clone().applyMat4(line.worldMatrix).applyMat4(ctx.view),
  );
  const path = line.closed ? [...view, view[0]] : view;
  const runs = clipPathNear(path, ctx.near);
  const style: PrimitiveStyle = {
    fill: null,
    stroke: lineColor(line.material),
    lineWidth: line.material.lineWidth,
    opacity: line.material.opacity,
  };
  const closed =
    line.closed && runs.length === 1 && runs[0].length === path.length;
  for (const run of runs) {
    const points = closed ? run.slice(0, -1) : run;
    const start = out.primitives.length;
    const depth = averageDistance(points);
    out.primitives.push({
      type: 'polyline',
      points: projectAll(points, ctx),
      closed,
      depth,
      ...style,
    });
    pushGroup(out, start, depth);
  }
}

/** Emit every point of a point cloud in front of the camera as a circle. */
export function compilePoints(
  cloud: Points,
  ctx: CompileContext,
  out: CompileOutput,
): void {
  const { material } = cloud;
  const fill = material.fill?.toCSS() ?? null;
  const stroke = material.stroke?.toCSS() ?? null;
  for (const p of cloud.positions) {
    const v = p.clone().applyMat4(cloud.worldMatrix).applyMat4(ctx.view);
    if (v.z > -ctx.near || v.z < -ctx.far) {
      continue;
    }
    const [x, y] = projectAll([v], ctx);
    const start = out.primitives.length;
    out.primitives.push({
      type: 'circle',
      x,
      y,
      radius: material.pointSize,
      depth: -v.z,
      fill,
      stroke,
      lineWidth: material.lineWidth,
      opacity: material.opacity,
    });
    pushGroup(out, start, -v.z);
  }
}

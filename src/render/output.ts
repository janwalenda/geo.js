import type { Vec3 } from '../math/Vec3';
import type { CompileOutput } from './types';

/** Surface of a group for occlusion tests; `null` for lines and points. */
interface GroupSurface {
  polygon: Vec3[];
  screen: number[];
}

/**
 * Record the primitives pushed since `start` as one sortable group (nothing
 * if no primitive was pushed).
 */
export function pushGroup(
  out: CompileOutput,
  start: number,
  depth: number,
  surface: GroupSurface | null = null,
): void {
  if (out.primitives.length <= start) {
    return;
  }
  out.groups.push({
    depth,
    polygon: surface?.polygon ?? null,
    screen: surface?.screen ?? null,
    start,
    end: out.primitives.length,
  });
}

/** The primitives of `out` in the order of the given groups. */
export function flattenGroups(
  out: CompileOutput,
  order: readonly number[],
): CompileOutput['primitives'] {
  return order.flatMap((index) => {
    const group = out.groups[index];
    return out.primitives.slice(group.start, group.end);
  });
}

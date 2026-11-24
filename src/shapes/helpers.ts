import { Vec2 } from '../math/Vec2';
import type { PointLike } from './types';

/** Convert a {@link PointLike} into a new {@link Vec2}. */
export function toVec2(p: PointLike): Vec2 {
  return 'x' in p ? new Vec2(p.x, p.y) : new Vec2(p[0], p[1]);
}

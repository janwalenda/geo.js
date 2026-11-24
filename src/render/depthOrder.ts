import { occlusionPairs } from './occlusion';
import { RankHeap } from './RankHeap';
import type { DepthItem } from './types';

/**
 * Back-to-front draw order (indices into `items`) for the painter's
 * algorithm.
 *
 * Sorting by depth alone fails for faces of very different size: a large
 * floor tile in front of an object can have its center nearer to the camera
 * than the object's faces, and would be painted over them. So wherever two
 * faces overlap on screen, their planes decide which one occludes the other
 * (as in Newell's algorithm) and the order is a topological sort of these
 * constraints. Pairs the planes cannot separate (intersecting faces) and
 * cycles fall back to the depth order. Pure function, `items` is not
 * modified.
 */
export function depthOrder(items: readonly DepthItem[]): number[] {
  // rank = position in plain depth order (stable: equal depths keep order).
  const byDepth = items
    .map((_, i) => i)
    .sort((a, b) => items[b].depth - items[a].depth || a - b);
  const rank = new Array<number>(items.length);
  byDepth.forEach((item, r) => {
    rank[item] = r;
  });

  const successors: number[][] = items.map(() => []);
  const indegree = new Array<number>(items.length).fill(0);
  for (const [behind, inFront] of occlusionPairs(items)) {
    successors[behind].push(inFront);
    indegree[inFront]++;
  }
  return kahn({ byDepth, rank, successors, indegree });
}

/** The constraint graph of {@link depthOrder}. */
interface OrderGraph {
  byDepth: number[];
  rank: number[];
  successors: number[][];
  indegree: number[];
}

/**
 * Kahn's topological sort, always taking the farthest ready item; on a cycle,
 * the farthest remaining item is forced next.
 */
function kahn(graph: OrderGraph): number[] {
  const { byDepth, rank, successors, indegree } = graph;
  const done = new Array<boolean>(byDepth.length).fill(false);
  const ready = new RankHeap(rank);
  indegree.forEach((count, i) => {
    if (count === 0) {
      ready.push(i);
    }
  });
  const order: number[] = [];
  let fallback = 0;
  while (order.length < byDepth.length) {
    let next = ready.pop();
    while (next !== undefined && done[next]) {
      next = ready.pop();
    }
    if (next === undefined) {
      fallback = byDepth.findIndex((item, r) => r >= fallback && !done[item]);
      next = byDepth[fallback];
    }
    done[next] = true;
    order.push(next);
    for (const s of successors[next]) {
      indegree[s]--;
      if (indegree[s] === 0 && !done[s]) {
        ready.push(s);
      }
    }
  }
  return order;
}

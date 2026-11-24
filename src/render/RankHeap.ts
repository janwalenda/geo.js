/**
 * Binary min-heap of item indices, keyed by their depth rank (smallest rank =
 * farthest item first). Used by {@link depthOrder}.
 */
export class RankHeap {
  private readonly heap: number[] = [];

  constructor(private readonly rank: readonly number[]) {}

  /** Number of items in the heap. */
  get size(): number {
    return this.heap.length;
  }

  /** Add an item. */
  push(item: number): void {
    const { heap, rank } = this;
    let i = heap.length;
    heap.push(item);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (rank[heap[parent]] <= rank[item]) {
        break;
      }
      heap[i] = heap[parent];
      i = parent;
    }
    heap[i] = item;
  }

  /** Remove and return the item with the smallest rank, if any. */
  pop(): number | undefined {
    const { heap } = this;
    const top = heap.at(0);
    const last = heap.pop();
    if (heap.length > 0 && last !== undefined) {
      this.siftDown(last);
    }
    return top;
  }

  /** Move `item` down from the root to its place. */
  private siftDown(item: number): void {
    const { heap, rank } = this;
    let i = 0;
    for (;;) {
      const smallest = this.smallestChild(i);
      if (smallest === null || rank[heap[smallest]] >= rank[item]) {
        break;
      }
      heap[i] = heap[smallest];
      i = smallest;
    }
    heap[i] = item;
  }

  /** Index of the child of `i` with the smaller rank, or `null` for a leaf. */
  private smallestChild(i: number): number | null {
    const { heap, rank } = this;
    const left = i * 2 + 1;
    const right = left + 1;
    if (left >= heap.length) {
      return null;
    }
    if (right < heap.length && rank[heap[right]] < rank[heap[left]]) {
      return right;
    }
    return left;
  }
}

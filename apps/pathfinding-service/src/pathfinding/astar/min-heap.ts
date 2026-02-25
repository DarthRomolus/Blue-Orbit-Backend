import type { ScoredState } from '../graph/state';

/**
 * Binary Min-Heap keyed on fCost.
 *
 * - push()    O(log n)
 * - pop()     O(log n)  — returns the node with the LOWEST fCost
 * - peek()    O(1)
 * - size      O(1)
 */
export class MinHeap {
  private heap: ScoredState[] = [];

  get size(): number {
    return this.heap.length;
  }

  peek(): ScoredState | undefined {
    return this.heap[0];
  }

  push(node: ScoredState): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): ScoredState | undefined {
    if (this.heap.length === 0) return undefined;

    const min = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return min;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (this.heap[parentIndex].fCost <= this.heap[index].fCost) break;

      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.heap[left].fCost < this.heap[smallest].fCost) {
        smallest = left;
      }

      if (right < length && this.heap[right].fCost < this.heap[smallest].fCost) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

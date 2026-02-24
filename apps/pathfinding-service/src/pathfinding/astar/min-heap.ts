import type { StatesList } from '../graph/state';

/**
 * Binary Min-Heap keyed on Fcost.
 *
 * - push()    O(log n)
 * - pop()     O(log n)  — returns the node with the LOWEST Fcost
 * - peek()    O(1)
 * - size      O(1)
 */
export class MinHeap {
  private heap: StatesList[] = [];

  get size(): number {
    return this.heap.length;
  }

  peek(): StatesList | undefined {
    return this.heap[0];
  }

  push(node: StatesList): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): StatesList | undefined {
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

      if (this.heap[parentIndex].Fcost <= this.heap[index].Fcost) break;

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

      if (left < length && this.heap[left].Fcost < this.heap[smallest].Fcost) {
        smallest = left;
      }

      if (right < length && this.heap[right].Fcost < this.heap[smallest].Fcost) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

/**
 * A blocking queue implementation with a fixed capacity. The enqueue and
 * dequeue methods will block if the queue is full or empty, respectively, until
 * space is available or an item is enqueued. This allows for producers being
 * throttled by back-pressure from the availability of consumers and a very
 * simple implementation of a continuous consumer.
 *
 * @example
 * async function consume(q, id) {
 *   while (true) {
 *     const msg = await q.dequeue();
 *     console.log(id, "started processing", msg);
 *     await new Promise((resolve) => setTimeout(resolve, 100)); // Pretend to be busy
 *     console.log(id, "finished processing", msg);
 *   }
 * }
 *
 * const q = new Queue(2);
 * consume(q, "Worker 1");
 * consume(q, "Worker 2");
 *
 * await q.enqueue("Hello, World 1!");  // Consumed immediately
 * await q.enqueue("Hello, World 2!");  // Consumed immediately
 * await q.enqueue("Hello, World 3!");  // Held in queue
 * await q.enqueue("Hello, World 4!");  // Held in queue
 * await q.enqueue("Hello, World 5!");  // Blocked until worker available
 * await q.enqueue("Hello, World 6!");  // Blocked until worker available
 *
 * @module
 */

export default class Queue {
  constructor(capacity) {
    this.capacity = capacity;
    this.queue = [];
    this.dequeueResolvers = [];
    this.enqueueResolvers = [];
  }

  /**
   * Put an item in the queue. If the queue is full and you `await` this
   * function it will block until space is available, allowing for back-pressure
   * to throttle producers. If you don't `await` this function, you effectively
   * have an "infinite" capacity, since the `enqueue` functions will wait in the
   * JavaScript event loop Promise queue. This is probably not what you want.
   *
   * @param {*} item - The item to put in the queue
   */
  async enqueue(item) {
    if (this.isFull()) await this.#whenDequeued();
    this.queue.push(item);
    this.#notifyEnqueued();
  }

  /**
   * Get the next item from the queue. If the queue is empty, this will block
   * until an item is enqueued. Always `await` this method to ensure you get the
   * proper result out.
   *
   * @returns The next item from the queue
   */
  async dequeue() {
    if (this.isEmpty()) await this.#whenEnqueued();
    const item = this.queue.shift();
    this.#notifyDequeued();
    return item;
  }

  /**
   * Peek at the next item in the queue without dequeuing it. This will return
   * `undefined` if the queue is empty, but it will not block.
   *
   * @returns The next item in the queue, or `undefined` if the queue is empty
   */
  peek() {
    if (this.queue.length === 0) {
      return undefined;
    }
    return this.queue[0];
  }

  /**
   * @returns The number of items currently in the queue
   */
  size() {
    return this.queue.length;
  }

  /**
   * @returns `true` if the queue is empty, `false` otherwise
   */
  isEmpty() {
    return this.queue.length === 0;
  }

  /**
   * @returns `true` if the queue is full, `false` otherwise
   */
  isFull() {
    return this.queue.length >= this.capacity;
  }

  // Some plumbing to allow producers and consumers of the queue to wait on one
  // another without busy-waiting. The #notify functions are async to ensure
  // that they run after the current call stack is cleared, allowing the current
  // producer or consumer to proceed before the next one is notified.

  #whenDequeued() {
    return new Promise((resolve) => {
      this.dequeueResolvers.push(resolve);
    });
  }

  #whenEnqueued() {
    return new Promise((resolve) => {
      this.enqueueResolvers.push(resolve);
    });
  }

  async #notifyEnqueued() {
    if (this.enqueueResolvers.length > 0) {
      const resolve = this.enqueueResolvers.shift();
      resolve();
    }
  }

  async #notifyDequeued() {
    if (this.dequeueResolvers.length > 0) {
      const resolve = this.dequeueResolvers.shift();
      resolve();
    }
  }
}

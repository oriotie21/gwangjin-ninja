class Queue {
  constructor() {
    this.buf = [];
  }
  enqueue(item) {
    this.buf.push(item);
  }
  dequeue() {
    return this.buf.shift();
  }
  empty() {
    return this.buf.length === 0;
  }
}
module.exports = Queue;

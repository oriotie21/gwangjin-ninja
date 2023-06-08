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
  length(){
    return this.buf.length;
  }
}
module.exports = Queue;

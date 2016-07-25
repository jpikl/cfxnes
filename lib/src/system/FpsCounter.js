export default class FpsCounter {

  constructor(size = 50) {
    this.time = 0;
    this.index = 0;
    this.diffs = new Array(size).fill(0);
  }

  update(now = window.performance.now()) {
    this.diffs[this.index] = now - this.time;
    this.index = (this.index + 1) % this.diffs.length;
    this.time = now;
  }

  get() {
    const sum = this.diffs.reduce((a, b) => a + b);
    const avg = sum / this.diffs.length;
    return 1000 / avg;
  }

}

export default class FpsCounter {

  constructor() {
    this.time = 0;
    this.index = 0;
    this.values = new Array(10).fill(0);
  }

  update() {
    const now = Date.now();
    this.values[this.index] = 1000 / (now - this.time);
    this.index = (this.index + 1) % this.values.length;
    this.time = now;
  }

  get() {
    const sum = this.values.reduce((a, b) => a + b);
    return sum / this.values.length;
  }

}

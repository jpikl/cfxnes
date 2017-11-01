import FpsCounter from '../../src/system/FpsCounter';

describe('system/FpsCounter', () => {
  it('computes average FPS from the last N time points', () => {
    const fpsCounter = new FpsCounter(5);
    for (const time of [1, 2, 3, 4, 5, 15, 30, 50, 75, 105]) {
      fpsCounter.update(time);
    }
    expect(fpsCounter.get()).to.equal(50);
  });
});

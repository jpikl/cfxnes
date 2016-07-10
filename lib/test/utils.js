/* eslint-env mocha */

export function asyncIt(name, ...calls) {
  it(name, done => {
    recursiveAsyncCall(done, calls);
  });
}

export function recursiveAsyncCall(done, calls) {
  setTimeout(() => {
    try {
      calls.shift()();
      if (calls.length) {
        recursiveAsyncCall(done, calls);
      } else {
        done();
      }
    } catch (error) {
      done(error);
    }
  }, 30);
}

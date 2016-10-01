export function asyncIt(name, timeout, ...calls) {
  it(name, done => {
    recursiveAsyncCall(done, timeout, calls);
  });
}

export function recursiveAsyncCall(done, timeout, calls) {
  setTimeout(() => {
    try {
      calls.shift()();
      if (calls.length) {
        recursiveAsyncCall(done, timeout, calls);
      } else {
        done();
      }
    } catch (error) {
      done(error);
    }
  }, timeout);
}

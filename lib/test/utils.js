// eslint-disable no-console

export function asyncIt(name, timeout, ...calls) {
  it(name, done => {
    recursiveAsyncCall(done, timeout, calls);
  });
}

export function recursiveAsyncCall(done, timeout, calls) {
  if (!calls.length) {
    done();
  }
  asyncCall(done, timeout, () => {
    const [firstCall, ...otherCalls] = calls;
    firstCall();
    recursiveAsyncCall(done, timeout, otherCalls);
  });
}

export function asyncCall(done, timeout, call) {
  setTimeout(() => {
    try {
      call();
    } catch (error) {
      done(error);
    }
  }, timeout);
}

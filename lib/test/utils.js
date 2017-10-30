export function asyncIt(name, timeout, ...calls) {
  it(name, done => {
    recursiveAsyncCall(done, timeout, ...calls);
  });
}

export function recursiveAsyncCall(done, timeout, call, ...otherCalls) {
  if (call) {
    asyncCall(done, timeout, () => {
      call();
      recursiveAsyncCall(done, timeout, ...otherCalls);
    });
  } else {
    done();
  }
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

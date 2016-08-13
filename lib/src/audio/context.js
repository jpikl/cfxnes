// Shared audio context between multiple emulator instances.
// Needed for unit tests to work. We could create/release context
// for every test case but that does not work in MS Edge.
let context;

export function getAudioContext() {
  if (context == null) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext;
  }
  return context;
}

export function closeAudioContext() {
  if (context == null) {
    return Promise.resolve();
  }
  const promise = context.close();
  context = undefined;
  return promise;
}

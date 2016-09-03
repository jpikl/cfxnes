// Shared audio context between multiple emulator instances.
// Needed for unit tests to work. We could create/release context
// for every test case but that does not work in MS Edge.
let context;

const AudioContext = window.AudioContext || window.webkitAudioContext;

export function hasAudioContext() {
  return AudioContext != null;
}

export function getAudioContext() {
  if (context == null) {
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

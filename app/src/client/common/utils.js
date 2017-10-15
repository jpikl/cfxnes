let idCounter = 0;

export function getUniqueId() {
  const id = ~~(1000000 * Math.abs(Math.random()));
  return `id-${id}-${idCounter++}`;
}

export function isMsExplorer() {
  return navigator.userAgent.indexOf('Trident/') >= 0;
}

export function isMsEdge() {
  return navigator.userAgent.indexOf('Edge/') >= 0;
}

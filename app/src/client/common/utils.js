let idCounter = 0;

export function getUniqueId() {
  const id = ~~(1000000 * Math.abs(Math.random()));
  return `id-${id}-${idCounter++}`;
}

export function isExplorerOrEdge() {
  const ua = navigator.userAgent;
  return ua.indexOf('MSIE ') >= 0
    || ua.indexOf('Trident/') >= 0
    || ua.indexOf('Edge/') >= 0;
}

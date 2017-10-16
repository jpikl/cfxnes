export function isMsExplorer() {
  return navigator.userAgent.indexOf('Trident/') >= 0;
}

export function isMsEdge() {
  return navigator.userAgent.indexOf('Edge/') >= 0;
}

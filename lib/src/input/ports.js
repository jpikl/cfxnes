const ports = [1, 2];

export default ports;

export function isPort(port) {
  return ports.indexOf(port) >= 0;
}

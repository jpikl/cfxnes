export default class DeviceInput {

  static fromString(string) {
    const parts = string.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const [portStr, device, name] = parts;
    const portNum = parseInt(portStr, 10);
    const port = isNaN(portNum) ? portStr : portNum;
    return new DeviceInput(port, device, name);
  }

  constructor(port, device, name) {
    this.port = port;
    this.device = device;
    this.name = name;
  }

  equals(other) {
    return this.port === other.port
        && this.device === other.device
        && this.name === other.name;
  }

  toString() {
    return `${this.port}.${this.device}.${this.name}`;
  }

}

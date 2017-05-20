export default class SourceInput {

  static fromString(string) {
    const parts = string.split('.');
    if (parts.length !== 2) {
      return null;
    }
    const [source, name] = parts;
    return new SourceInput(source, name);
  }

  constructor(source, name) {
    this.source = source;
    this.name = name;
  }

  equals(other) {
    return (this.source === other.source)
        && (this.name === other.name);
  }

  toString() {
    return `${this.source}.${this.name}`;
  }

}

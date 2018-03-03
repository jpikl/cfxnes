export default function readProperties(source) {
  const result = {};

  for (const key in source) {
    const desc = Object.getOwnPropertyDescriptor(source, key);

    if (desc.enumerable) {
      const value = source[key];

      if (desc.writable || desc.set) {
        result[key] = value;
      } else if (typeof value === 'object') {
        result[key] = readProperties(value);
      }
    }
  }

  return result;
}

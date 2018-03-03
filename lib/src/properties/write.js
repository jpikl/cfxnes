export default function writeProperties(target, source) {
  for (const key in source) {
    if (key in target) {
      const value = source[key];

      if (value !== undefined) {
        const desc = Object.getOwnPropertyDescriptor(target, key);

        if (desc.enumerable) {
          if (desc.writable || desc.set) {
            target[key] = value;
          } else if (typeof value === 'object') {
            writeProperties(target[key], value);
          }
        }
      }
    }
  }
}

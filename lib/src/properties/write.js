export default function writeProperties(props, values) {
  for (const key in values) {
    if (key in props) {
      const value = values[key];

      if (value !== undefined) {
        const desc = Object.getOwnPropertyDescriptor(props, key);

        if (desc.enumerable) {
          if (desc.writable || desc.set) {
            props[key] = value;
          } else if (typeof value === 'object') {
            writeProperties(props[key], value);
          }
        }
      }
    }
  }
}

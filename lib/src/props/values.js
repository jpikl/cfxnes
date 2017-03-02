export function readPropertyValues(props) {
  const values = {};
  for (const key in props) {
    const desc = Object.getOwnPropertyDescriptor(props, key);
    if (desc.enumerable) {
      const prop = props[key];
      if (desc.writable || desc.set) {
        values[key] = prop;
      } else if (typeof prop === 'object') {
        values[key] = readPropertyValues(prop);
      }
    }
  }
  return values;
}

export function writePropertyValues(props, values) {
  for (const key in values) {
    if (key in props) {
      const value = values[key];
      if (value !== undefined) {
        const desc = Object.getOwnPropertyDescriptor(props, key);
        if (desc.enumerable) {
          if (desc.writable || desc.set) {
            props[key] = value;
          } else if (typeof value === 'object') {
            writePropertyValues(props[key], value);
          }
        }
      }
    }
  }
}

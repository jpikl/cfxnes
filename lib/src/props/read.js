export default function readProps(props) {
  const values = {};
  for (const key in props) {
    const desc = Object.getOwnPropertyDescriptor(props, key);
    if (desc.enumerable) {
      const prop = props[key];
      if (desc.writable || desc.set) {
        values[key] = prop;
      } else if (typeof prop === 'object') {
        values[key] = readProps(prop);
      }
    }
  }
  return values;
}

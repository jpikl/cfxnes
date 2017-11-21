export function identity(value) {
  return value;
}

export function capitalize(value) {
  return value && (value[0].toUpperCase() + value.substr(1));
}

let idCounter = 0;

export function getUniqueId() {
  const id = ~~(1000000 * Math.abs(Math.random()));
  return `id-${id}-${idCounter++}`;
}

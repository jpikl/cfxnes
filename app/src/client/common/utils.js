let idCounter = 0;

export function getUniqueId() {
  const id = ~~(1000000 * Math.abs(Math.random()));
  return `id-${id}-${idCounter++}`;
}

export function debounce(callback, timeout) {
  let id = null;
  return () => {
    clearTimeout(id);
    id = setTimeout(callback, timeout);
  };
}

export function capitalize(value) {
  return value[0].toUpperCase() + value.substr(1);
}

export function identity(value) {
  return value;
}

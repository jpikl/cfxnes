export function noop() {
}

export function debounce(callback, timeout) {
  let id = null;
  return () => {
    clearTimeout(id);
    id = setTimeout(callback, timeout);
  };
}

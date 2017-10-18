/* global setTimeout, clearTimeout */

export function debounce(callback, timeout) {
  let id = null;
  return () => {
    clearTimeout(id);
    id = setTimeout(callback, timeout);
  };
}

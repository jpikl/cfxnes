export function parseBoolean(value) {
  return value !== 'false' && value !== '0' && Boolean(value);
}

export function removePrefix(value, prefix, caseInsensitive) {
  let currentPrefix = value.substr(0, prefix.length);

  if (caseInsensitive) {
    currentPrefix = currentPrefix.toLowerCase();
    prefix = prefix.toLowerCase();
  }

  if (currentPrefix === prefix) {
    return value.substr(prefix.length);
  }

  return value;
}

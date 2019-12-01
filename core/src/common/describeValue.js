const MAX_STRING_LENGTH = 80;

/**
 * Returns human-readable representation of a value.
 * @param {*} value Value of any type.
 * @return {string} Text describing the value.
 */
export default function describeValue(value) {
  const type = typeof value;
  if (type === 'string') {
    if (value.length > MAX_STRING_LENGTH) {
      return `"${value.substr(0, MAX_STRING_LENGTH)}..."`;
    }
    return `"${value}"`;
  }
  if (type === 'function') {
    const constructorName = getFunctionName(value.constructor);
    const name = getFunctionName(/** @type {!Function} */ (value));
    return name ? `${constructorName}(${name})` : constructorName;
  }
  if (value && type === 'object') {
    const constructorName = getFunctionName(value.constructor);
    if (constructorName === 'Object') {
      return constructorName;
    }
    const {length} = value;
    return length != null ? `${constructorName}(${length})` : constructorName;
  }
  return String(value);
}

/**
 * Returns name of a function.
 * @param {!Function} fn Function.
 * @return {string} Function name.
 */
function getFunctionName(fn) {
  if (fn.name) {
    return fn.name;
  }
  // IE does not support the 'name' property
  const matchResult = fn.toString().match(/function ([^(]+)/);
  if (matchResult && matchResult[1]) {
    return matchResult[1];
  }
  return '';
}

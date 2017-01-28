function object(props) {
  return properties({}, props);
}

function properties(obj, props) {
  return Object.defineProperties(obj, props);
}

function constant(value) {
  return {value};
}

function computed(get, ...args) {
  return {get: get.bind(...args)};
}

function writable(get, set, ...args) {
  return {get: get.bind(...args), set: set.bind(...args)};
}

function writableMap(keys, get, set, thisArg) {
  const props = {};
  for (const key of keys) {
    props[key] = writable(get, set, thisArg, key);
  }
  return props;
}

function method(func, thisArg) {
  return constant(func.bind(thisArg));
}

function nested(props) {
  return constant(props ? object(props) : null);
}

export const define = {object, properties, constant, computed, writable, writableMap, method, nested};

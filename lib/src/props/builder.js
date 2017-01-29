function constant(value) {
  return {value};
}

function computed(get, ...args) {
  return {
    get: bind(get, ...args),
  };
}

function writable(get, set, ...args) {
  return {
    get: bind(get, ...args),
    set: bind(set, ...args),
    enumerable: true,
  };
}

function hiddenWritable(get, set, ...args) {
  return {
    get: bind(get, ...args),
    set: bind(set, ...args),
  };
}

function method(func, ...args) {
  return constant(bind(func, ...args));
}

function nested(props) {
  return {
    value: Object.defineProperties({}, props),
    enumerable: true,
  };
}

function nestedWritable(keys, get, set, ...args) {
  const [firstArg, ...otherArgs] = args;
  const props = {};
  for (const key of keys) {
    props[key] = writable(get, set, firstArg, key, ...otherArgs);
  }
  return nested(props);
}

function bind(func, ...args) {
  return args.length ? func.bind(...args) : func;
}

export default {
  constant, computed, writable,
  hiddenWritable, method, nested,
  nestedWritable,
};

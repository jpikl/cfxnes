export function constant(value) {
  return {value};
}

export function computed(get, ...args) {
  return {
    get: bind(get, ...args),
  };
}

export function writable(get, set, ...args) {
  return {
    get: bind(get, ...args),
    set: bind(set, ...args),
    enumerable: true,
  };
}

export function hiddenWritable(get, set, ...args) {
  return {
    get: bind(get, ...args),
    set: bind(set, ...args),
  };
}

export function method(func, ...args) {
  return constant(bind(func, ...args));
}

export function nested(props) {
  return {
    value: Object.defineProperties({}, props),
    enumerable: true,
  };
}

export function nestedWritable(keys, get, set, ...args) {
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

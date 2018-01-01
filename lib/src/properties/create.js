export function constantProperty(value) {
  return {value};
}

export function computedProperty(get, ...args) {
  return {
    get: bind(get, ...args),
  };
}

export function writableProperty(get, set, ...args) {
  return {
    get: bind(get, ...args),
    set: bind(set, ...args),
    enumerable: true,
  };
}

export function hiddenWritableProperty(get, set, ...args) {
  return {
    get: bind(get, ...args),
    set: bind(set, ...args),
  };
}

export function methodProperty(func, ...args) {
  return constantProperty(bind(func, ...args));
}

export function nestedProperty(props) {
  return {
    value: Object.defineProperties({}, props),
    enumerable: true,
  };
}

export function nestedWritableProperty(keys, get, set, ...args) {
  const [firstArg, ...otherArgs] = args;
  const props = {};
  for (const key of keys) {
    props[key] = writableProperty(get, set, firstArg, key, ...otherArgs);
  }
  return nestedProperty(props);
}

function bind(func, ...args) {
  return args.length ? func.bind(...args) : func;
}

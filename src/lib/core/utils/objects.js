//=========================================================
// Object utilities
//=========================================================

export function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}

// Recursive property getter
export function getProperty(object, ...names) {
  for (var i = 0; object != null && i < names.length; i++) {
    object = object[names[i]];
  }
  return object;
}

// Recursive property setter
export function setProperty(object, ...namesAndValue) {
  if (namesAndValue.length < 2) {
    throw new Error('setProperty: function requires at least 3 arguments');
  }
  var lastNameIndex = namesAndValue.length - 2;
  for (var i = 0; i < lastNameIndex; i++) {
    var name = namesAndValue[i];
    if (object[name] == null) {
      object[name] = {};
    }
    object = object[name];
  }
  object[namesAndValue[lastNameIndex]] = namesAndValue[lastNameIndex + 1];
}

export function forEeachProperty(object, callback, thisArg) {
  for (var name in object) {
    if (object.hasOwnProperty(name)) {
      callback.call(thisArg, name, object[name]);
    }
  }
}

export function copyProperties(source, target = {}) {
  forEeachProperty(source, (name, value) => {
    target[name] = value;
  });
  return target;
}

export function mergeProperties(source1, source2) {
  return copyProperties(source2, copyProperties(source1));
}

export function makeEnumeration(enumeration) {
  var paramsTable = {};
  var defaultParams;
  forEeachProperty(enumeration, (id, params) => {
    if (typeof params !== 'function') {
      defaultParams = defaultParams || params;
      paramsTable[params.id || id] = params;
      enumeration[id] = params.id || id;
    }
  });
  enumeration.getParams = function(id) {
    return paramsTable[id] || defaultParams;
  };
  enumeration.toString = function(id) {
    var params = this.getParams(id);
    return params && (params.name || params.id) || id;
  };
}

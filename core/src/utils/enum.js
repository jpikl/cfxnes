//=========================================================
// Enum utilities
//=========================================================

export function makeEnum(object) {
  const params = {};

  for (const key in object) {
    const value = object[key];
    if (typeof value === 'object') {
      const id = value.id || key;
      object[key] = id;
      params[id] = value;
    }
  }

  object.getParams = function getParams(id) {
    return params[id] || {};
  };

  object.toString = function toString(id) {
    return object.getParams(id).name || String(id);
  };

  return object;
}

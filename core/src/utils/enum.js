//=========================================================
// Enum utilities
//=========================================================

export function makeEnum(object) {
  var params = {};

  for (var key in object) {
    var value = object[key];
    if (typeof value === 'object') {
      var id = value.id || key;
      object[key] = id;
      params[id] = value;
    }
  }

  object.getParams = function(id) {
    return params[id] || {};
  };

  object.toString = function(id) {
    return object.getParams(id).name || String(id);
  };

  return object;
}

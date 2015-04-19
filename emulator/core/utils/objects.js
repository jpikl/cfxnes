//=========================================================
// Object utilities
//=========================================================

// Recursive property getter
export function getProperty(object /* , name1, name2, ... */) {
    for (var i = 1; object != null && i < arguments.length; i++) {
        object = object[arguments[i]];
    }
    return object;
}

// Recursive property setter
export function setProperty(object /* , name1, name2, ..., value */) {
    if (arguments.length < 3) {
        throw new Error("setProperty: function requires at least 3 arguments");
    }
    var lastNameIndex = arguments.length - 2;
    for (var i = 1; i < lastNameIndex; i++) {
        var name = arguments[i];
        if (object[name] == null) {
            object[name] = {};
        }
        object = object[name];
    }
    object[arguments[lastNameIndex]] = arguments[lastNameIndex + 1];
}

export function forEeachProperty(object, callback, thisArg) {
    for (var name in object) {
        if (object.hasOwnProperty(name)) {
            callback.call(thisArg, name, object[name]);
        }
    }
}

export function copyProperties(source, target) {
    forEeachProperty(source, (name, value) => {
        target[name] = value;
    });
}

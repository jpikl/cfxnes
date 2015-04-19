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

// A way more efficient than ordinary Function.prototype.bind()
export function bindMethod(object, method, paramsCount) {
    if (typeof object !== "object" || object === null) {
        throw new Error("bindMethod: invalid 'object' parameter");
    }
    if (typeof method !== "function") {
        throw new Error("bindMethod: invalid 'method' parameter");
    }
    if (paramsCount == null) {
        paramsCount = method.length;
    } else if (typeof paramsCount !== "number") {
        throw new Error("bindMethod: invalid 'paramsCount' parameter");
    }
    switch(paramsCount) {
        case 0: return ()           => method.call(object);
        case 1: return (a1)         => method.call(object, a1);
        case 2: return (a1, a2)     => method.call(object, a1, a2);
        case 3: return (a1, a2, a3) => method.call(object, a1, a2, a3);
        default: throw new Error(`bindMethod: unsupported number of mehod parameters (${paramsCount})`);
    }
}

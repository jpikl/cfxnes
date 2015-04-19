//=========================================================
// Object utilities
//=========================================================

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

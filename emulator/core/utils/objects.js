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

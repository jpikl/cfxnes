//=========================================================
// Object utilities
//=========================================================

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
        throw new Error("setProperty: function requires at least 3 arguments");
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

export function makeEnumeration(object) {
    var values = {};
    forEeachProperty(object, (id, value) => {
        if (typeof value !== "function") {
            values[id] = value
            object[id] = value.id || id;
        }
    });
    object.getValue = function(id) {
        return values[id];
    };
    object.toString = function(id) {
        var value = this.getValue(id);
        return value && value.name || id;
    };
}

export function createProxy(name, target) {
    var proxy = function(...args) {
        var target = proxy.get();
        if (typeof target === "function") {
            return target.apply(target, args);
        }
        return target;
    };
    proxy.get = function() {
        if (this.missing()) {
            throw new Error((name ? name : "Proxy target") + " is not available");
        }
        return this.target;
    };
    proxy.set = function(target) {
        this.target = target;
    };
    proxy.available = function() {
        return this.target != null;
    };
    proxy.missing = function() {
        return !this.available();
    };
    proxy.set(target);
    return proxy;
}

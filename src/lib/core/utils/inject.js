import { forEachProperty, createProxy } from "./objects"
import { logger }                       from "./logger";

//=========================================================
// Dependency injector
//=========================================================

export class Injector {

    constructor(config) {
        logger.info("Creating injector");
        this.dependencies = {};
        for (var name in config) {
            this.put(name, config[name]);
        }

    }

    put(name, dependency) {
        this.dependencies[name] = {
            type: dependency.type,
            value: dependency.value,
            resolved: false
        };
    }

    get(name) {
        var dependency = this.dependencies[name];
        if (!dependency) {
            throw new Error(`Dependency '${name}' is not defined.`);
        }
        if (!dependency.resolved) {
            logger.info(`Resolving dependency '${name}'`);
            dependency.value = this.resolve(name, dependency);
            dependency.resolved = true;
            this.inject(dependency.value);
        }
        return dependency.value;

    }

    resolve(name, dependency) {
        var type = dependency.type;
        if (type == null) {
            throw new Error(`'${name}' dependency has undefined type`);
        }
        var value = dependency.value;
        if (type !== "proxy" && value == null) {
            throw new Error(`'${name}' dependency has undefined value`);
        }
        if (type === "class") {
            return new value(this);
        } else if (type === "factory") {
            return value(this);
        } else if (type === "proxy") {
            return createProxy(name, value);
        } else {
            return value;
        }
    }

    inject(object) {
        var dependencies = object.dependencies;
        var injectMethod = object.inject;
        if (dependencies && injectMethod) {
            logger.info(`Injecting dependencies: ${dependencies.join(", ")}`);
            injectMethod.apply(object, dependencies.map(name => this.get(name)));
        }
        return object;
    }

}

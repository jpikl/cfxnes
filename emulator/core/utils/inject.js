import { logger } from "./logger";

//=========================================================
// Dependency injection library
//=========================================================

export class Injector {

    constructor(config) {
        logger.info("Creating injector");
        this.dependencies = {};
        this.processConfig(config);

    }

    processConfig(config) {
        logger.info("Processing injector configuration");
        for (name in config) {
            var clazz = config[name];
            this.dependencies[name] = {
                clazz: clazz
            };
        }
    }

    getDependency(name) {
        var dependency = this.dependencies[name];
        if (!dependency) {
            throw new Error(`Dependency '${name}' not found.`);
        }
        return dependency;
    }

    getClass(name) {
        return this.getDependency(name).clazz;
    }

    get(name) {
        var dependency = this.getDependency(name);
        if (!dependency.instance) {
            dependency.instance = this.create(name);
            this.inject(dependency.instance);
        }
        return dependency.instance;
    }

    create(name) {
        logger.info(`Creating instance of '${name}'`);
        return new(this.getClass(name))(this);
    }

    inject(instance) {
        var dependencies = instance.constructor["dependencies"];
        var injectMethod = instance.inject || instance.init;
        if (dependencies && injectMethod) {
            logger.info(`Injecting dependencies: ${dependencies.join(", ")}`);
            var resolvedDependencies = []
            for (var name of dependencies) {
                resolvedDependencies.push(this.get(name));
            }
            injectMethod.apply(instance, resolvedDependencies);
        }
        return instance;
    }

}

//=========================================================
// Dependency injection configuration
//=========================================================

export class Config {

    constructor(config) {
        if (config) {
            this.include(config)
        }
    }

    include(config) {
        for (name in config) {
            if (config.hasOwnProperty(name)) {
                this[name] = config[name];
            }
        }
        return this;
    }

    clone() {
        return new Config(this);
    }

    merge(config) {
        return this.clone().include(config);
    }

}

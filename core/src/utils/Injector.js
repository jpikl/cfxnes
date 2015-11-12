import logger from './logger';
import { mergeProperties } from './objects';

//=========================================================
// Dependency injector
//=========================================================

export default class Injector {

  constructor(config) {
    logger.info('Creating injector');
    this.dependencies = {};
    for (var name in config) {
      this.put(name, config[name]);
    }
  }

  put(name, dependency) {
    this.dependencies[name] = mergeProperties(dependency, {resolved: false});
  }

  get(name) {
    var dependency = this.dependencies[name];
    if (!dependency) {
      throw new Error(`Dependency "${name}" is not defined.`);
    }
    if (!dependency.resolved) {
      logger.info(`Resolving dependency "${name}"`);
      dependency.value = this.resolve(name, dependency);
      dependency.resolved = true;
      if (typeof dependency.value === 'object' && dependency.value != null) {
        this.inject(dependency.value);
      }
    }
    return dependency.value;

  }

  resolve(name, dependency) {
    if (typeof dependency.class !== 'undefined') {
      if (typeof dependency.class === 'function') {
        return new dependency.class(this); // jscs:ignore requireCapitalizedConstructors
      }
      throw new Error(`Class of "${name}" dependency is not a function`);
    }
    if (typeof dependency.factory !== 'undefined') {
      if (typeof dependency.factory === 'function') {
        return dependency.factory(this);
      }
      throw new Error(`Factory of "${name}" dependency is not a function`);
    }
    if (typeof dependency.value !== 'undefined') {
      return dependency.value;
    }
    throw new Error(`Dependency "${name}" has no class, factory or value specified`);
  }

  inject(object) {
    var dependencies = object.dependencies;
    var injectMethod = object.inject;
    if (dependencies && injectMethod) {
      logger.info(`Injecting dependencies: ${dependencies.join(', ')}`);
      injectMethod.apply(object, dependencies.map(name => this.get(name)));
    }
    return object;
  }

}

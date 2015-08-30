import logger from './logger';
import { forEachProperty } from './objects';

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
    this.dependencies[name] = {
      type: dependency.type,
      value: dependency.value,
      resolved: false,
    };
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
    var type = dependency.type;
    var value = dependency.value;
    if (type == null) {
      throw new Error(`Dependency "${name}" has undefined type`);
    }
    if (type == 'value') {
      return value;
    }
    if (value == null) {
      throw new Error(`Dependency "${name}" of type "${type}" has undefined value`);
    }
    if (type === 'class') {
      return new value(this); // jscs:ignore requireCapitalizedConstructors
    } else if (type === 'factory') {
      return value(this);
    } else {
      throw new Error(`Dependency "${name}" has unsupported type "${type}"`);
    }
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

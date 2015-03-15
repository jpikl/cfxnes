var ROOT_PATH, logger;

logger = require("./logger").get();

ROOT_PATH = "../..";

function Injector(configuration) {
  var clazz, name, ref;
  logger.info("Creating injector");
  this.dependencies = {};
  ref = this.resolveConfiguration(configuration);
  for (name in ref) {
    clazz = ref[name];
    this.dependencies[name] = {
      clazz: clazz
    };
  }
}

Injector.prototype.resolveConfiguration = function(configuration) {
  if (typeof configuration === "function") {
    configuration = this.buildConfiguration(configuration);
  }
  return configuration;
};

Injector.prototype.buildConfiguration = function(builder) {
  logger.info("Building injector configuration");
  if (builder.constructor != null) {
    return new builder;
  } else {
    return builder();
  }
};

Injector.prototype.getDependency = function(name) {
  var dependency;
  dependency = this.dependencies[name];
  if (dependency == null) {
    throw new Error("Dependency '" + name + "' not found.");
  }
  return dependency;
};

Injector.prototype.getClass = function(name) {
  return this.getDependency(name).clazz;
};

Injector.prototype.getInstance = function(name) {
  var dependency;
  dependency = this.getDependency(name);
  if (!dependency.instance) {
    dependency.instance = this.createInstance(name);
    this.injectInstance(dependency.instance);
  }
  return dependency.instance;
};

Injector.prototype.createInstance = function(name) {
  logger.info("Creating instance of '" + name + "'");
  return new (this.getClass(name))(this);
};

Injector.prototype.injectInstance = function(instance) {
  var dependencies, dependency, injectMethod, resolvedDependencies;
  dependencies = instance.constructor.dependencies;
  injectMethod = instance.inject || instance.init;
  if (dependencies && injectMethod) {
    logger.info("Injecting dependencies: " + (dependencies.join(', ')));
    resolvedDependencies = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = dependencies.length; i < len; i++) {
        dependency = dependencies[i];
        results.push(this.getInstance(dependency));
      }
      return results;
    }).call(this);
    injectMethod.apply(instance, resolvedDependencies);
  }
  return instance;
};

module.exports = Injector;

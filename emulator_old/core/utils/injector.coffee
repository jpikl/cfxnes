logger = require("./logger").get()

ROOT_PATH = "../.."

###########################################################
# Dependency injection
###########################################################

class Injector

    constructor: (configuration) ->
        logger.info "Creating injector"
        @dependencies = {}
        for name, clazz of @resolveConfiguration configuration
            @dependencies[name] = { clazz: clazz }

    ###########################################################
    # Configuration processing
    ###########################################################

    resolveConfiguration: (configuration) ->
        # if typeof configuration is "string"
        #     configuration = @readConfiguration configuration
        if typeof configuration is "function"
            configuration = @buildConfiguration configuration
        configuration

    # readConfiguration: (path) ->
    #     logger.info "Reading injector configuration '#{path}'"
    #     require "#{ROOT_PATH}/#{path}"

    buildConfiguration: (builder) ->
        logger.info "Building injector configuration"
        if builder.constructor? then new builder else builder()

    ###########################################################
    # Getter methotds
    ###########################################################

    getDependency: (name) ->
        dependency = @dependencies[name]
        unless dependency?
            throw new Error "Dependency '#{name}' not found."
        dependency

    getClass: (name) ->
        @getDependency(name).clazz

    getInstance: (name) ->
        dependency = @getDependency name
        unless dependency.instance
            dependency.instance = @createInstance name
            @injectInstance dependency.instance
        dependency.instance

    ###########################################################
    # Factory methotds
    ###########################################################

    createInstance: (name) ->
        logger.info "Creating instance of '#{name}'"
        new (@getClass name)(this)

    injectInstance: (instance) ->
        dependencies = instance.constructor.dependencies
        injectMethod = instance.inject or instance.init
        if dependencies and injectMethod
            logger.info "Injecting dependencies: #{dependencies.join ', '}"
            resolvedDependencies = for dependency in dependencies
                @getInstance dependency
            injectMethod.apply instance, resolvedDependencies
        instance

module.exports = Injector

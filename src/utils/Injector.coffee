###########################################################
# Dependency injection
###########################################################

class Injector

    constructor: (configuration) ->
        @dependencies = {}
        for name, value of @resolveConfiguration configuration
            @dependencies[name] = value

    ###########################################################
    # Configuration processing
    ###########################################################

    resolveConfiguration: (configuration) ->
        if typeof configuration is "string"
            configuration = @readConfiguration configuration
        if typeof configuration is "function"
            configuration = @buildConfiguration configuration
        configuration

    readConfiguration: (module) ->
        require "../#{module}"

    buildConfiguration: (builder) ->
        if builder.constructor? then new builder else builder()

    ###########################################################
    # Getter methotds
    ###########################################################

    getDependency: (name) ->
        dependency = @dependencies[name]
        throw "Dependency '#{name}' not found." unless dependency?
        dependency

    getClass: (name) ->
        dependency = @getDependency(name)
        dependency.clazz ?= require "../#{dependency.module}" 

    getInstance: (name) ->
        if @isSingleton name
            @getSingleton name
        else
            @createInjectedInstance name

    getSingleton: (name) ->
        @getDependency(name).instance ? @createInjectedSingleton name

    isSingleton: (name) ->
        @getDependency(name).singleton

    ###########################################################
    # Factory methotds
    ###########################################################

    createInjectedSingleton: (name) ->
        @injectInstance @createSingleton name

    createSingleton: (name) ->
        @getDependency(name).instance = @createInstance name

    createInjectedInstance: (name) ->
        @injectInstance @createInstance name

    createInstance: (name) ->
        new (@getClass name)

    injectInstance: (instance) ->
        if instance.constructor.inject?
            for dependency in instance.constructor.inject
                instance[dependency] = @getInstance dependency
        instance

module.exports = Injector

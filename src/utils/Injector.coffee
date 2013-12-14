class Injector

    constructor: (configuration) ->
        @dependencies = []
        for name of configuration
            @dependencies[name] = configuration[name]

    getDependency: (name) ->
        dependency = @dependencies[name]
        throw "Dependency '#{name}' not found." unless dependency?
        dependency

    getInstance: (name) ->
        if @isSingleton name
            @getSingleton name
        else
            @createInstance name

    isSingleton: (name) ->
        @getDependency(name).singleton

    getSingleton: (name) ->
        @getDependency(name).instance ?= @createInstance name

    createInstance: (name) ->
        clazz = @getClass name
        parameters = @getConstructorParameters clazz
        values = (@getInstance value for value in parameters)
        new clazz values...

    getClass: (name) ->
        dependency = @getDependency name
        dependency.clazz ?= require "../#{dependency.module}" 

    getConstructorParameters: (clazz) ->
        constructor = clazz.toString()
        matches = constructor.match /^function\s*[^\(]*\(\s*([^\)]*)\)/m
        if matches[1] then matches[1].split ", " else []

module.exports = Injector

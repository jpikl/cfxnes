###########################################################
# Plugin for gulp that bundles multiple node js modules
# into one file which can be used in browser.
###########################################################

buffer = require "buffer"
es     = require "event-stream"
gutil  = require "gulp-util"
path   = require "path"

Buffer      = buffer.Buffer
File        = gutil.File;
PluginError = gutil.PluginError

generateInit = -> """
    var modules = {};
    var results = {};

    var createRequire = function(basePath) {
        return function(path) {
            var parts = basePath == "." ? [] : basePath.split("/");
            path.split("/").forEach(function(part) {
                if (part == "..") {
                    parts.pop();
                } else if (part != ".") {
                    parts.push(part);
                }
            });
            var name = parts.join("/");
            var fullName = name + ".js";
            var result = results[fullName];
            if (typeof result == "undefined") {
                var module = modules[fullName];
                if (typeof module == "undefined") {
                    throw new Error("Module '" + name + "' not found");
                }
                result = results[fullName] = module.call(this);
            }
            return result;
        };
    }

    """

generateModule = (file, contents) -> """
    modules["#{file}"] = function() {
        var require = createRequire("#{path.dirname file}");
        var module = { exports: {} };

        #{contents}

        return module.exports;
    };

    """

generateEntry = (entryFile) -> """
    modules["#{entryFile}"].call(this);
    """

module.exports = (options) ->
    unless options?.entryFile
        throw new PluginError "gulp-bundle-modules", "Missing entryFile option"
    unless options?.outputFile
        throw new PluginError "gulp-bundle-modules", "Missing outputFile option"

    buffer = [ new Buffer generateInit() ]

    write = (file) ->
        if file.isStream()
            return @emit "error", new PluginError "gulp-bundle-modules", "Streaming not supported"
        unless file.isNull()
            normPath = path.normalize file.path
            basePath = path.relative file.cwd, normPath
            contents = file.contents.toString "utf8"
            module = generateModule basePath, contents
            buffer.push new Buffer module, "utf8"

    end = ->
        entryFile = path.normalize options.entryFile
        entry = generateEntry entryFile
        buffer.push new Buffer entry, "utf8"
        @emit "data", new File
            path:     options.outputFile
            contents: Buffer.concat buffer
        @emit "end"

    es.through write, end

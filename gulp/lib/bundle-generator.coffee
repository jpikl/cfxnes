###########################################################
# Node.js module bundle generator library
###########################################################

path = require "path"

###########################################################
# Global variable names
###########################################################

MODULE_FUNCTIONS = "__moduleFunctions__"
MODULE_RESULTS   = "__moduleResults__"
CREATE_REQUIRE   = "__createRequire__"

###########################################################
# Code generator library
###########################################################

bundleGenerator =

    generateInitCode: ->
        """
        var #{MODULE_FUNCTIONS} = {};
        var #{MODULE_RESULTS} = {};

        var #{CREATE_REQUIRE} = function(basePath) {
            return function(relativePath) {
                var parts = basePath == "." ? [] : basePath.split("/");
                relativePath.split("/").forEach(function(part) {
                    if (part == "..") {
                        parts.pop();
                    } else if (part != ".") {
                        parts.push(part);
                    }
                });
                var moduleName = parts.join("/");
                var modulePath = moduleName + ".js";
                var moduleResult = #{MODULE_RESULTS}[modulePath];
                if (typeof moduleResult == "undefined") {
                    var moduleFunc = #{MODULE_FUNCTIONS}[modulePath];
                    if (typeof moduleFunc == "undefined") {
                        throw new Error("Module '" + moduleName + "' not found");
                    }
                    moduleResult = #{MODULE_RESULTS}[modulePath] = moduleFunc.call(this);
                }
                return moduleResult;
            };
        }

        """

    generateModuleCode: (modulePath, moduleContents) ->
        basePath = path.dirname modulePath
        """
        #{MODULE_FUNCTIONS}["#{modulePath}"] = function() {
            var require = #{CREATE_REQUIRE}("#{basePath}");
            var module = { exports: {} };
            var exports = module.exports;

            #{moduleContents}

            return module.exports;
        };

        """

    generateEntryCode: (entryModulePath) ->
        """
        #{MODULE_FUNCTIONS}["#{entryModulePath}"].call(this);
        """

module.exports = bundleGenerator

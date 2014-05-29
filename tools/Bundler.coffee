#!/usr/bin/coffee

fs       = require "fs"
path     = require "path"
optimist = require "optimist"

###########################################################
# Command line options
###########################################################

argv = optimist
    .usage("Merge multiple NodeJS modules into one.\nUsage: $0 [options] input-files...")
    .string("entry")
    .alias("entry", "e")
    .describe("entry", "Entry file.")
    .string("output")
    .alias("output", "o")
    .describe("output", "Output file.")
    .string("directory")
    .alias("directory", "d")
    .describe("directory", "Set working directory")
    .boolean("help")
    .alias("help", "h")
    .describe("help", "Print this help.")
    .argv

if argv.help or argv._.length == 0
    optimist.showHelp()
    return 1

###########################################################
# Configuration
###########################################################

process.chdir argv.directory if argv.directory?
inputFiles = argv._
entryFile = argv.entry or inputFiles[inputFiles.length - 1]
outputFd = fs.openSync argv.output, "w" if argv.output?
writeOutput = if outputFd? then fs.writeSync.bind this, outputFd else console.log
closeOutput = if outputFd? then fs.closeSync.bind this, outputFd else ( -> )

###########################################################
# Output generation
###########################################################

writeOutput """
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

for file in inputFiles
    file = path.normalize file
    content = fs.readFileSync file
    directory = path.dirname file;
    writeOutput """
        modules["#{file}"] = function() {
            var require = createRequire("#{directory}");
            var module = { exports: {} };

            #{content}

            return module.exports;
        };

        """

writeOutput """
        modules["#{entryFile}"].call(this);
        """

closeOutput()

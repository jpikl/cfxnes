#!/usr/bin/coffee

BaseConfig  = require "../build/core/config/base-config"
Injector    = require "../build/core/utils/injector"
Logger      = require "../build/core/utils/logger"
numberAsHex = require("../build/core/utils/format").numberAsHex
readline    = require "readline"
path        = require "path"
util        = require "util"
yargs       = require "yargs"

argv = yargs
    .usage "Usage: $0 <file> [options]"
    .demand 1
    .describe "v", "Enables verbose output."
    .alias "v", "verbose"
    .boolean "v"
    .describe "s", "Executes specified number of steps instead of running debugger in interactive mode."
    .alias "s", "steps"
    .nargs "s", 1
    .help "h"
    .alias "h", "help"
    .check (argv) ->
        steps = argv.steps
        if steps? and (typeof steps isnt "number" or steps <= 0)
            "invalid number of steps"
        else
            true
    .argv

loggerId = if argv.verbose then "debug-verbose" else "debug-basic"
logger = Logger.get loggerId
logger.attach Logger.console()

config = new BaseConfig
config.cpu = "core/debug/debug-cpu"
config.ppu = "core/debug/debug-ppu"

injector = new Injector config

cartridgeFactory = injector.getInstance "cartridgeFactory"
cartridge = cartridgeFactory.fromLocalFile argv._[0]

nes = injector.getInstance "nes"
nes.insertCartridge cartridge

if argv.steps?
    nes.step() for [1..argv.steps]
    process.exit 0

stdin = process.stdin
stdout = process.stdout

rl = readline.createInterface stdin, stdout
rl.setPrompt "command>"
rl.prompt()

rl.on "line", (line) ->
    stdout.moveCursor 0, -1
    stdout.clearLine()
    values = line.trim().split /\s+/
    switch values[0]
        when "h", "help"
            stdout.write "s, step <number> ... Performs specified number of steps (default 1).\n"
            stdout.write "x, exec <code>   ... Executes JS code.\n"
            stdout.write "h, help          ... Prints this help.\n"
            stdout.write "q, quit          ... Quits the debugger.\n"
        when "s", "step", "steps"
            count = parseInt values[1] or 1
            nes.step() for [1..count]
        when "x", "exec"
            try
                result = eval values[1..].join " "
                if typeof result is "object"
                    result = util.inspect result,
                        colorize: true
                        depth: 0
                    result = result.replace /.*\[Function\].*\n/g, ""
                else if typeof result is "number"
                    result = "0x#{numberAsHex result}"
                stdout.write "#{result}\n"
            catch error
                stdout.write "#{error.message}\n"
        when "q", "quit"
            process.exit 0
        else
            stdout.write "Type 'help' to print available commands.\n"
    rl.prompt()

rl.on "close", ->
    stdout.write "\n"
    process.exit 0

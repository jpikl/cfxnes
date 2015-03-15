#!/usr/bin/coffee

###########################################################
# CFxNES debugger
###########################################################

BaseConfig  = require "../build/core/config/base-config"
Injector    = require "../build/core/utils/injector"
Logger      = require "../build/core/utils/logger"
numberAsHex = require("../build/core/utils/format").numberAsHex
readline    = require "readline"
path        = require "path"
util        = require "util"
yargs       = require "yargs"

###########################################################
# Command line parser
###########################################################

argv = yargs
    .usage "Usage: $0 <file> [options]"
    .demand 1
    .describe "v", "Enables verbose output."
    .alias "v", "verbose"
    .boolean "v"
    .describe "s", "Executes specified number of steps instead of running debugger in interactive mode."
    .alias "s", "step"
    .nargs "s", 1
    .describe "b", "Sets JS code that will break execution if evaluated to true."
    .alias "b", "break"
    .nargs "b", 1
    .help "h"
    .alias "h", "help"
    .check (argv) ->
        steps = argv.steps
        if steps? and (typeof steps isnt "number" or steps <= 0)
            "invalid number of steps"
        else
            true
    .argv

###########################################################
# Initialization
###########################################################

loggerId = if argv.verbose then "debug-verbose" else "debug-basic"
logger = Logger.get loggerId

config = new BaseConfig
config.cpu = "core/debug/debug-cpu"
config.ppu = "core/debug/debug-ppu"

injector = new Injector config

cartridgeFactory = injector.getInstance "cartridgeFactory"
cartridge = cartridgeFactory.fromLocalFile argv._[0]

nes = injector.getInstance "nes"
nes.insertCartridge cartridge

stdin = process.stdin
stdout = process.stdout

###########################################################
# Commands
###########################################################

breakCondition = null

helpCommand = (param) ->
    stdout.write "s, step  <number> ... Performs specified number of steps (default: 1).\n"
    stdout.write "j, jump  <number> ... Same as 'step' but does not print output.\n"
    stdout.write "b, break <code>   ... Sets JS code that will break 'step'/'jump' if evaluated to true (empty value to disable).\n"
    stdout.write "x, exec  <code>   ... Executes JS code.\n"
    stdout.write "h, help           ... Prints this help.\n"
    stdout.write "q, quit           ... Quits the debugger.\n"

jumpCommand = (param) ->
    count = parseInt(param) or 1
    for [1..count]
        if breakCondition
            try
                result = eval breakCondition
                if result
                    nes.step()
                    stdout.write "[Break] #{breakCondition} => #{result}\n"
                    break
            catch error
                stdout.write "[Error] #{error.message}\n"
                break
        nes.step()

stepCommand = (param) ->
    logger.attach Logger.console()
    jumpCommand param
    logger.detach Logger.console()

breakCommand = (param) ->
    breakCondition = param
    stdout.write "[Break] #{breakCondition or '-- cleared --'}\n"

execCommand = (param) ->
    return unless param
    try
        result = eval param
        if typeof result is "object"
            result = util.inspect result,
                colorize: true
                depth: 0
            result = result
                .replace "{", "{\n "
                .replace "}", "\n}"
                .replace /.*\[Function\].*\n/g, ""
        else if typeof result is "number"
            result = "0x#{numberAsHex result}"
        stdout.write "[Exec] #{param} = #{result}\n"
    catch error
        stdout.write "[Error] #{error.message}\n"

quitCommand = (param) ->
    process.exit 0

###########################################################
# Immadiate mode
###########################################################

if argv.step?
    breakCommand argv.break if argv.break?.trim()
    stepCommand argv.step
    process.exit 0

###########################################################
# Interactive mode
###########################################################

rl = readline.createInterface stdin, stdout
rl.setPrompt "command>"
rl.prompt()

rl.on "line", (line) ->
    stdout.moveCursor 0, -1
    stdout.clearLine()
    input = line.trim().split /\s+/
    command = input[0]
    param = input[1..].join " "
    switch command
        when "h", "help"  then helpCommand param
        when "s", "step"  then stepCommand param
        when "j", "jump"  then jumpCommand param
        when "b", "break" then breakCommand param
        when "x", "exec"  then execCommand param
        when "q", "quit"  then quitCommand param
        else stdout.write "Type 'help' to print available commands.\n"
    rl.prompt()

rl.on "close", ->
    stdout.write "\n"
    process.exit 0

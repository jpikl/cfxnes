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

print = console.log

###########################################################
# Commands
###########################################################

breakCondition = null

helpCommand = (param) ->
    print "s, step  <number> ... Performs specified number of steps (default: 1)."
    print "j, jump  <number> ... Same as 'step' but does not print output."
    print "b, break <code>   ... Sets JS code that will break 'step'/'jump' if evaluated to true (empty value to disable)."
    print "x, exec  <code>   ... Executes JS code."
    print "r, reset          ... Resets CPU."
    print "h, help           ... Prints this help."
    print "q, quit           ... Quits the debugger."

jumpCommand = (param) ->
    count = parseInt(param) or 1
    for [1..count]
        if breakCondition
            try
                result = eval breakCondition
                if result
                    print "Break condition '#{breakCondition}' evaluated to #{result}"
                    break
            catch error
                print "Error when evaluating break condition '#{breakCondition}': #{error.message}"
                break
        nes.step()

stepCommand = (param) ->
    logger.attach Logger.console()
    jumpCommand param
    logger.detach Logger.console()

breakCommand = (param) ->
    breakCondition = param
    if breakCondition
        print "Break condition set to '#{breakCondition}'"
    else
        print "Break condition cleared"


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
        print "#{param} = #{result}"
    catch error
        print "Error: #{error.message}"

resetCommand = (param) ->
    nes.pressReset()

quitCommand = (param) ->
    process.exit 0

###########################################################
# Immadiate mode
###########################################################

if argv.step?
    breakCommand argv.break if argv.break?.trim()
    stepCommand argv.step
    quitCommand()

###########################################################
# Interactive mode
###########################################################

rl = readline.createInterface process.stdin, process.stdout
rl.setPrompt "command>"
rl.prompt()

rl.on "line", (line) ->
    input = line.trim().split /\s+/
    command = input[0]
    param = input[1..].join " "
    switch command
        when "h", "help"  then helpCommand param
        when "s", "step"  then stepCommand param
        when "j", "jump"  then jumpCommand param
        when "b", "break" then breakCommand param
        when "x", "exec"  then execCommand param
        when "r", "reset" then resetCommand param
        when "q", "quit"  then quitCommand param
        else print "Type 'help' to print available commands."
    rl.prompt()

rl.on "close", ->
    quitCommand()

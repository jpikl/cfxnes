###########################################################
# Plugin for gulp that provides customized CoffeeScript
# compiler with function/method inlining capability.
###########################################################

hook = require "./lib/coffee-inline-hook"

hook()

module.exports = require "gulp-coffee"

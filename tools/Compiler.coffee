Parser  = require("coffee-script/lib/coffee-script/parser").parser
Command = require "coffee-script/lib/coffee-script/command"

parse = Parser.parse
Parser.parse = (source) ->
    modifyAST parse.call this, source

modifyAST = (ast) ->
    level = 0
    functions = findFunctions ast
    level++ while level < 10 and inlineFunctions ast, functions
    ast

findFunctions = (ast) ->
    functions = []
    ast.eachChild (node) ->
        functions.push node.variable.base.value if node.value?.params?
    functions

inlineFunctions = (ast, functions) ->
    false

Command.run()

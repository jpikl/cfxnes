Parser  = require "coffee-script/lib/coffee-script/parser"
Command = require "coffee-script/lib/coffee-script/command"
Nodes   = require "coffee-script/lib/coffee-script/nodes"

Access  = Nodes.Access
Assign  = Nodes.Assign
Base    = Nodes.Base
Block   = Nodes.Block
Call    = Nodes.Call
Class   = Nodes.Class
Code    = Nodes.Code
Literal = Nodes.Literal
Obj     = Nodes.Obj
Value   = Nodes.Value

parse = Parser.parser.parse
baseContext = "__no_class__"

Base::getChild = (id) ->
    result = null
    position = 0
    @eachChild (child) ->
        if position is id or child instanceof id
            result = child
            false
        else
            ++position
    result

Base::hasChild = (id) ->
    @getChild(id) isnt null

Base::getLiteralValue = ->
    @getChild(Literal).value

Base::isClass = ->
    this instanceof Class

Class::getName = ->
    @getChild(Value).getLiteralValue()

Class::getBody = ->
    @getChild(Block).getChild(Value).getChild(Obj)

Base::isFunction = ->
    this instanceof Assign and @hasChild(Code)

Assign::getName = ->
    @getChild(Value).getLiteralValue()

Assign::getBody = ->
    @getChild(Code)

Base::isCall = ->
    this instanceof Call

Call::isInlineCall = ->
    (@isFunctionCall() or @isSelfMethodCall()) and @getBareName()[0] is "_"

Call::getName = ->
    if @isInlineCall()
        @getBareName()[1..]
    else
        @getBareName()

Call::getBareName = ->
    if @isMethodCall()
        @getMethodName()
    else
        @getFunctionName()

Call::isFunctionCall = ->
    @isCall() and @getMethod() is null

Call::isMethodCall = ->
    @isCall() and @getMethod() isnt null

Call::isSelfMethodCall = ->
    @isMethodCall() and @getMethodTarget() is "this"

Call::getFunctionName = ->
    @getFunction().getLiteralValue()

Call::getFunction = ->
    @getChild(0)

Call::getMethodName = ->
    @getMethod().getLiteralValue()

Call::getMethodTarget = ->
    @getChild(0).getLiteralValue()

Call::getMethod = ->
    @getChild(0).getChild(Access)

Parser.parser.parse = (source) ->
    modifyAST parse.call this, source

modifyAST = (ast) ->
    functions = findFunctions ast
    level = 0
    level++ while level < 10 and inlineFunctions ast, functions
    ast

findFunctions = (ast, functions = {}, context = baseContext) ->
    functions[context] ?= {}
    ast.eachChild (node) ->
        if node.isClass()
            findFunctions node.getBody(), functions, node.getName()
        else if node.isFunction()
            functions[context][node.getName()] = node.getBody()
    functions

inlineFunctions = (ast, functions, context = baseContext) ->
    ast.traverseChildren true, (node) ->
        if node.isClass()
            inlineFunctions node.getBody(), functions, node.getName()
        else if node.isCall() and node.isInlineCall()
            context = baseContext unless node.isMethodCall()
            # TODO inline it!
    false

Command.run()

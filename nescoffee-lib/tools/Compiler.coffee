#!/usr/bin/coffee

Parser  = require "coffee-script/lib/coffee-script/parser"
Command = require "coffee-script/lib/coffee-script/command"
Nodes   = require "coffee-script/lib/coffee-script/nodes"

###########################################################
# AST classes
###########################################################

Access  = Nodes.Access
Assign  = Nodes.Assign
Base    = Nodes.Base
Block   = Nodes.Block
Call    = Nodes.Call
Class   = Nodes.Class
Code    = Nodes.Code
Literal = Nodes.Literal
Obj     = Nodes.Obj
Op      = Nodes.Op
Param   = Nodes.Param
Parens  = Nodes.Parens
Value   = Nodes.Value

###########################################################
# Configuration
###########################################################

MAX_RECURSION = 10

parse = Parser.parser.parse
baseContext = "__no_class__"
uniqueId = 0

inliningEnabled = false
for i in [process.argv.length - 1 .. 0]
    if process.argv[i] is "--inline"
        inliningEnabled = true
        process.argv.splice i, 1

###########################################################
# AST - core methods
###########################################################

Base::clone = ->
    clone(this)

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

Base::replaceChild = (oldChild, newChild) ->
    for name in @children
        child = @[name]
        if child is oldChild
            @[name] = newChild
            return
        else if child instanceof Array
            for value, i in child
                if value is oldChild
                    child[i] = newChild
                    return

###########################################################
# AST - literals and values
###########################################################

Base::isLiteral = ->
    this instanceof Literal

Base::isValue = ->
    this instanceof Value

Base::getLiteralValue = ->
    @getChild(Literal)?.getValue()

Base::setLiteralValue = (value) ->
    @getChild(Literal).setValue value

Literal::getValue = ->
    @value

Literal::setValue = (value) ->
    @value = value

###########################################################
# AST - operations
###########################################################

Base::isOperation = ->
    this instanceof Op

Base::isIncrementation = ->
    @isOperation() and @getOperator() is "++"

Base::isDecrementation = ->
    @isOperation() and @getOperator() is "--"

Base::isModifingOperation = ->
    @isIncrementation() or @isDecrementation()

Base::isModifingInstruction = ->
    @isAssign() or @isModifingOperation()

Op::getOperator = ->
    @operator

Op::getVariableName = ->
    @first.getLiteralValue()

###########################################################
# AST - assignment
###########################################################

Base::isAssign = ->
    this instanceof Assign

Assign::getName = ->
    @getChild(Value).getLiteralValue()

Assign::getBody = ->
    @getChild(Code)

Assign::getVariableName = ->
    @getChild(0).getLiteralValue()

###########################################################
# AST - blocks
###########################################################

Block::insertExpression = (node) ->
    @expressions.unshift node

Block::renameLiterals = (oldName, newName) ->
    @traverseChildren true, (node) ->
        node.setValue(newName) if node.isLiteral() and node.getValue() is oldName

Block::replaceLiterals = (name, replacement) ->
    replaceLiterals this, name, replacement

replaceLiterals = (node, name, replacement) ->
    node.eachChild (child) ->
        if child.isValue() and child.getLiteralValue() is name
            node.replaceChild child, replacement
        else
            replaceLiterals child, name, replacement

###########################################################
# AST - functions
###########################################################

Base::isFunction = ->
    @isAssign() and @hasChild(Code)

Base::isParameter = ->
    this instanceof Param

Code::getParameterNames = ->
    names = []
    @eachChild (child) ->
        names.push child.getLiteralValue() if child.isParameter()
    names

Code::getBlock = ->
    @getChild(Block)

###########################################################
# AST - calls
###########################################################

Base::isCall = ->
    this instanceof Call

Base::isInlineCall = ->
    (@isFunctionCall() or @isSelfMethodCall()) and isInlineCallName @getBareName()

Call::getName = ->
    if @isInlineCall()
        fixInlineCallName @getBareName()
    else
        @getBareName()

Call::getBareName = ->
    if @isMethodCall()
        @getMethodName()
    else
        @getFunctionName()

Call::setBareName = (name) ->
    if @isMethodCall()
        @setMethodName name
    else
        @setFunctionName name

Call::getArguments = ->
    args = []
    position = 0
    @eachChild (child) ->
        args.push child if position++ > 0
    args

Call::unmakeInline = ->
    @setBareName fixInlineCallName @getBareName()

###########################################################
# AST - function calls
###########################################################

Base::isFunctionCall = ->
    @isCall() and @getMethod() is null

Call::getFunction = ->
    @getChild(0)

Call::getFunctionName = ->
    @getFunction()?.getLiteralValue()

Call::setFunctionName = (name) ->
    @getFunction().setLiteralValue name

###########################################################
# AST - method calls
###########################################################

Base::isMethodCall = ->
    @isCall() and @getMethod() isnt null

Base::isSelfMethodCall = ->
    @isMethodCall() and @getMethodTarget() is "this"

Call::getMethod = ->
    @getChild(0)?.getChild(Access)

Call::getMethodName = ->
    @getMethod()?.getLiteralValue()

Call::setMethodName = (name) ->
    @getMethod().setLiteralValue name

Call::getMethodTarget = ->
    @getChild(0)?.getLiteralValue()

###########################################################
# AST - classes
###########################################################

Base::isClass = ->
    this instanceof Class

Class::getName = ->
    @getChild(Value).getLiteralValue()

Class::getBody = ->
    @getChild(Block).getChild(Value).getChild(Obj)

###########################################################
# Modified CoffeeScript parser
###########################################################

Parser.parser.parse = (source) ->
    modifyAST parse.call this, source

modifyAST = (ast) ->
    functions = findFunctions ast
    level = 0
    while level < MAX_RECURSION and inlineCallExists ast
        inlineFunctions ast, functions
        level++
    ast

findFunctions = (ast, functions = {}, context = baseContext) ->
    functions[context] ?= {}
    ast.eachChild (node) ->
        if node.isClass()
            findFunctions node.getBody(), functions, node.getName()
        else if node.isFunction()
            functions[context][node.getName()] = node.getBody()
    functions

inlineCallExists = (ast) ->
    exists = false
    ast.traverseChildren true, (child) ->
        exists or= child.isInlineCall()
        not exists
    exists

inlineFunctions = (ast, functions, context = baseContext) ->
    ast.eachChild (node) ->
        if node.isClass()
            inlineFunctions node.getBody(), functions, node.getName()
        else if node.isInlineCall()
            if inliningEnabled
                context = baseContext unless node.isMethodCall()
                func = functions[context]?[node.getName()]
                throw "Unable to inline '#{node.getName()}' (function not found)." unless func?
                ast.replaceChild node, createInlinedCode(node, func)
            else
                node.unmakeInline()
                inlineFunctions node, functions, context
        else
            inlineFunctions node, functions, context
        true

createInlinedCode = (call, func) ->
    args = call.getArguments()
    modified = (arg.isModifingOperation() for arg in args)
    usesCount = (0 for [0...args.length])
    parameters = func.getParameterNames()
    block = func.getBlock().clone()
    block.traverseChildren true, (node) ->
        if node.isModifingInstruction()
            position = parameters.indexOf node.getVariableName()
            modified[position] = true if position >= 0
        if node.isLiteral()
            position = parameters.indexOf node.getValue()
            usesCount[position]++ if position >= 0
        true
    for pos in [args.length - 1 .. 0] by -1
        if modified[pos] or (not args[pos].isValue() and usesCount[pos] isnt 1)
            oldName = parameters[pos]
            newName = "__tmp_#{oldName}_#{uniqueId++}__"
            block.renameLiterals oldName, newName
            block.insertExpression createAssignment(newName, args[pos])
        else
            block.replaceLiterals parameters[pos], args[pos]
    new Value(new Parens(block))

createAssignment = (name, value) ->
    variable = new Value(new Literal(name))
    new Assign(variable, value)

###########################################################
# Utilities
###########################################################

isInlineCallName = (name) ->
    name.length > 1 and name[0] is "$"

fixInlineCallName = (name) ->
    name[1..]

clone = (source) ->
    if source is null or typeof source isnt "object"
        return source
    if source instanceof Array
        return (clone(value) for value in source)
    copy = { __proto__: source.__proto__ }
    for key, value of source
        copy[clone(key)] = clone(value) if source.hasOwnProperty key
    copy

###########################################################
# Compiler execution
###########################################################

Command.run()

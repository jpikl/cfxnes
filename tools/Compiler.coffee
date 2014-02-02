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
Op      = Nodes.Op
Param   = Nodes.Param
Parens  = Nodes.Parens
Value   = Nodes.Value

parse = Parser.parser.parse
baseContext = "__no_class__"
uniqueId = 0

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
        if @[name] is oldChild
            @[name] = newChild
            return

Base::getLiteralValue = ->
    @getChild(Literal).getValue()

Base::isCall = ->
    this instanceof Call

Base::isInlineCall = ->
    (@isFunctionCall() or @isSelfMethodCall()) and @getBareName()[0] is "_"

Base::isClass = ->
    this instanceof Class

Base::Assign = ->
    this instanceof Assign

Base::isFunction = ->
    @Assign() and @hasChild(Code)

Base::isParameter = ->
    this instanceof Param

Base::isValue = ->
    this instanceof Value

Base::isModifingInstruction = ->
    @Assign() or @isModifingOperation()

Base::isModifingOperation = ->
    @isIncrementation() or @isDecrementation()

Base::isIncrementation = ->
    @isOperation() and @getOperator() is "++"

Base::isDecrementation = ->
    @isOperation() and @getOperator() is "--"

Base::isOperation = ->
    this instanceof Op

Base::isLiteral = ->
    this instanceof Literal

Class::getName = ->
    @getChild(Value).getLiteralValue()

Class::getBody = ->
    @getChild(Block).getChild(Value).getChild(Obj)

Assign::getName = ->
    @getChild(Value).getLiteralValue()

Assign::getBody = ->
    @getChild(Code)

Code::getParameterNames = ->
    names = []
    @eachChild (child) ->
        names.push child.getLiteralValue() if child.isParameter()
    names

Code::getBlock = ->
    @getChild(Block)

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

Base::isFunctionCall = ->
    @isCall() and @getMethod() is null

Base::isMethodCall = ->
    @isCall() and @getMethod() isnt null

Base::isSelfMethodCall = ->
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

Call::getArguments = ->
    args = []
    position = 0
    @eachChild (child) ->
        args.push child if position++ > 0
    args

Assign::getVariableName = ->
    @getChild(0).getLiteralValue()

Op::getOperator = ->
    @operator

Op::getVariableName = ->
    @first.getLiteralValue()

Literal::getValue = ->
    @value

Literal::setValue = (value) ->
    @value = value

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
        else if node.isInlineCall()
            context = baseContext unless node.isMethodCall()
            func = functions[context]?[node.getName()]
            throw "Unable to inline '#{node.getName()}' (function not found)." unless func?
            ast.replaceChild node, createInlinedCode(node, func)
            true
        else
            inlineFunctions node, functions, context
    false

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
        if modified[pos] or (not arg.isValue() and usesCount[pos] isnt 1)
            oldName = parameters[pos]
            newName = "__tmp_#{oldName}_#{uniqueId++}__"
            block.insertExpression createAssignment(newName, args[pos])
            block.renameLiterals oldName, newName
        else if not arg.isValue() and usesCount[pos] is 1
            block.replaceLiterals parameters[pos], args[pos]
    new Value(new Parens(block))

createAssignment = (name, value) ->
    variable = new Value(new Literal(name))
    new Assign(variable, value)

clone = (source) ->
    if source is null or typeof source isnt "object"
        return source
    if source instanceof Array
        return (clone(value) for value in source)
    copy = { __proto__: source.__proto__ }
    for key, value of source
        copy[clone(key)] = clone(value) if source.hasOwnProperty key
    copy

Command.run()
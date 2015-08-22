//=========================================================
// CFxNES debugger
//=========================================================

import readline           from "readline";
import util               from "util";
import yargs              from "yargs";
import coreConfig         from "../lib/core/config";
import { LoggingCPU }     from "../lib/core/debug/logging-cpu";
import { NoOutputPPU }    from "../lib/core/debug/no-output-ppu";
import { numberAsHex }    from "../lib/core/utils/format";
import { Injector }       from "../lib/core/utils/inject";
import { Logger }         from "../lib/core/utils/logger";
import { copyProperties } from "../lib/core/utils/objects";

//=========================================================
// Command line parser
//=========================================================

var argv = yargs
    .usage("Usage: $0 <file> [options]")
    .demand(1)
    .describe("v", "Enables verbose output.")
    .alias("v", "verbose")
    .boolean("v")
    .describe("s", "Executes specified number of steps instead of running debugger in interactive mode.")
    .alias("s", "step")
    .nargs("s", 1)
    .describe("b", "Sets JS code that will break execution if evaluated to true.")
    .alias("b", "break")
    .nargs("b", 1)
    .help("h")
    .alias("h", "help")
    .check(argv => {
        var steps = argv.steps;
        if ((steps != null) && (typeof steps !== "number" || steps <= 0)) {
            return "invalid number of steps";
        } else {
            return true;
        }
    }).argv;

//=========================================================
// Initialization
//=========================================================

var loggerId = argv.verbose ? "debug-verbose" : "debug-basic";
var logger = Logger.get(loggerId);
var print = console.log;

var config = copyProperties(coreConfig);
config["cpu"] = {type: "class", value: LoggingCPU};
config["ppu"] = {type: "class", value: NoOutputPPU};

var injector = new Injector(config);
var cartridgeFactory = injector.get("cartridgeFactory");
var cartridge = cartridgeFactory.fromLocalFile(argv._[0]);
var nes = injector.get("nes");

logger.attach(Logger.toConsole());
nes.insertCartridge(cartridge);
logger.detach(Logger.toConsole());

//=========================================================
// Commands
//=========================================================

var breakCondition = null;

function helpCommand() {
    print("s, step  <number> ... Performs specified number of steps (default: 1).");
    print("j, jump  <number> ... Same as 'step' but does not print output.");
    print("b, break <code>   ... Sets JS code that will break 'step'/'jump' if evaluated to true (empty value to disable).");
    print("x, exec  <code>   ... Executes JS code.");
    print("r, reset          ... Resets CPU.");
    print("h, help           ... Prints this help.");
    print("q, quit           ... Quits the debugger.");
}

function jumpCommand(param) {
    var count = parseInt(param) || 1;
    for (var i = 0; i < count; i++) {
        if (breakCondition) {
            try {
                var result = eval(breakCondition);
                if (result) {
                    print(`Break condition '${breakCondition}' evaluated to ${result}`);
                    break;
                }
            } catch (error) {
                print(`Error when evaluating break condition '${breakCondition}': ${error.message}`);
                break;
            }
        }
        nes.step();
    }
}

function stepCommand(param) {
    logger.attach(Logger.toConsole());
    jumpCommand(param);
    logger.detach(Logger.toConsole());
}

function breakCommand(param) {
    breakCondition = param;
    if (breakCondition) {
        print(`Break condition set to '${breakCondition}'`);
    } else {
        print("Break condition cleared");
    }
}

function execCommand(param) {
    if (!param) {
        return;
    }
    try {
        var result = eval(param);
        if (typeof result === "number") {
            result = `0x${numberAsHex(result)}`;
        } else if (typeof result === "object") {
            result = util.inspect(result, {
                colorize: true,
                depth: 0
            });
            result = result
                .replace("{", "{\n ")
                .replace("}", "\n}")
                .replace(/.*\[Function\].*\n/g, "");
        }
        print(`${param} = ${result}`);
    } catch (error) {
        print(`Error: ${error.message}`);
    }
}

function resetCommand() {
    nes.pressReset();
}

function quitCommand() {
    process.exit(0);
}

//=========================================================
// Immediate mode
//=========================================================

if (argv.step != null) {
    if (argv.break) {
        breakCommand(argv.break.trim());
    }
    stepCommand(argv.step);
    quitCommand();
}

//=========================================================
// Interactive mode
//=========================================================

var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt("command>");
rl.prompt();

rl.on("line", line => {
    var input = line.trim().split(/\s+/);
    var command = input[0];
    var param = input.slice(1).join(" ");

    switch (command) {
        case "h":
        case "help":
            helpCommand();
            break;
        case "s":
        case "step":
            stepCommand(param);
            break;
        case "j":
        case "jump":
            jumpCommand(param);
            break;
        case "b":
        case "break":
            breakCommand(param);
            break;
        case "x":
        case "exec":
            execCommand(param);
            break;
        case "r":
        case "reset":
            resetCommand();
            break;
        case "q":
        case "quit":
            quitCommand();
            break;
        default:
            print("Type 'help' to print available commands.");
    }

    rl.prompt();
});

rl.on("close", () => quitCommand());

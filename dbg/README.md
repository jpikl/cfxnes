# CFxNES Debugger

Tool for debugging of NES ROM images using the [CFxNES emulator](../README.md).

## Usage

    ./bin/debugger <file> [options]

Use `-h` option to see description of all available options.

## Examples

Run debugger in interactive mode:

    ./bin/debugger game.nes

Execute 100 CPU instructions with verbose text output:

    ./bin/debugger game.nes -s 100 -v

Execute 100 CPU instructions, break execution when 0x10 is written to the accumulator:

    ./bin/debugger game.nes -s 100 -b "cpu.accumulator == 0x10"

Execute 100 CPU instructions (without text output) and then take screenshot of the video output:

    ./bin/debugger game.nes -j 100 -p screen.png

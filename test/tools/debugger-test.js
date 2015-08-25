//=============================================================================
// Debugger smoke test
//=============================================================================

import chai from "chai"
import child_process from "child_process"

var expect = chai.expect;

describe("Debugger", () => {

    it("should execute N steps", () => {
        expectResult(["./test/roms/nestest/nestest.nes", "-s3"], {
            status: 0,
            stderr: [],
            stdout: [
                "C004  78        SEI  A:00 X:00 Y:00 P:24 SP:FD",
                "C005  D8        CLD  A:00 X:00 Y:00 P:24 SP:FD",
                "C006  A2 FF     LDX  A:00 X:00 Y:00 P:24 SP:FD"
        ]});
    });

});

function expectResult(args, {status, stdout, stderr}) {
    args.unshift("./bin/debugger");
    var result = child_process.spawnSync("node", args);

    if (stderr !== undefined) {
        expect(readLines(result.stderr)).to.be.deep.equal(stderr, "Different error output");
    }
    if (stdout !== undefined) {
        expect(readLines(result.stdout)).to.be.deep.equal(stdout, "Different output");
    }
    if (status !== undefined) {
        expect(result.status).to.be.equal(status, "Different exit code");
    }
}

function readLines(buffer) {
    var lines = buffer.toString().split("\n");
    lines.pop();
    return lines;
}

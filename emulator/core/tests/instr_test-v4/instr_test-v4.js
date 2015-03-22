import { FakeUnit } from "../../debug/fake-unit"

export const name = "instr_test-v4";
export const rom = "./emulator/core/tests/instr_test-v4/instr_test-v4.nes"

export function configure(config) {
    config["ppu"] = FakeUnit;
    config["apu"] = FakeUnit;
}

export function execute(test) {
    test.blargg();
}

import {copyFileSync, existsSync, mkdirSync, writeFileSync} from "fs";
import {join, basename} from "path";
import RomDb from "./src/server/roms/RomDb.js";

const {stderr, argv, exit} = process;
const [self, inputDir, outputDir] = argv.slice(1);

if (!inputDir || !outputDir) {
  stderr.write(`Usage: ${self} <input-dir> <output-dir>\n`);
  exit(1);
}

const romDb = new RomDb(inputDir, {romsFilePath: basename(outputDir)});
romDb.reload();

const roms = romDb.getRoms();
const dataFile = join(outputDir, "data.json");

if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

writeFileSync(dataFile, JSON.stringify(roms), "utf8");

for (const rom of roms) {
  for (const attr of ["file", "thumbnail"]) {
    if (rom[attr]) {
      const name = basename(rom[attr]);
      const src = romDb.getFile(name);
      const dst = join(outputDir, name);
      copyFileSync(src, dst);
    }
  }
}

import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'fs';
import {join, basename} from 'path';
import RomDb from './RomDb';

const {stdout, stderr, argv, exit} = process;
const [self, inputDir] = argv.slice(1);

if (!inputDir) {
  stderr.write(`Usage: ${basename(self)} <input-dir>\n`);
  exit(1);
}

const outputDir = `${__dirname}/static/roms`;

stdout.write('ROM importer started\n');
stdout.write(`Input dir: ${inputDir}\n`);
stdout.write(`Output dir: ${outputDir}\n`);

const romDb = new RomDb(inputDir, {romsFilePath: basename(outputDir)});
romDb.reload();

const roms = romDb.getRoms();
stdout.write(`Importing ${roms.length} ROM(s)...\n`);

if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

const dataFile = join(outputDir, 'data.json');
writeFileSync(dataFile, JSON.stringify(roms), 'utf8');

for (const rom of roms) {
  for (const attr of ['file', 'thumbnail']) {
    if (rom[attr]) {
      const fileName = basename(rom[attr]);
      const srcFile = romDb.getFile(fileName);
      const dstFile = join(outputDir, fileName);
      copyFileSync(srcFile, dstFile);
    }
  }
}

stdout.write('ROM importer finished\n');

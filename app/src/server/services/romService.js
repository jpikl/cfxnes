import fs from 'fs';
import path from 'path';

const ROMS_DIR = path.join(__dirname, '..', 'roms');

var romList = [];  // List of ROM descriptors
var romMap = {};   // ID   -> ROM descriptor
var romFiles = {}; // Name -> ROM filename

//=========================================================
// Service API
//=========================================================

export function init() {
  if (!fs.existsSync(ROMS_DIR)) {
    fs.mkdirSync(ROMS_DIR);
  }
  scanROMs();
  fs.watch(ROMS_DIR, scanROMs);
}

export function getROMs(req, res) {
  res.json(romList);
}

export function getROM(req, res) {
  var id = req.params.id;
  if (id == null) {
    res.status(400).send('Missing ROM ID.');
    return;
  }

  var rom = romMap[id];
  if (rom == null) {
    res.status(404).send(`ROM with ID ${id} not found.`);
    return;
  }

  return res.json(rom);
}

export function getFile(req, res) {
  var name = req.params.name;
  if (name == null) {
    res.status(400).send('Missing filename.');
    return;
  }

  var file = romFiles[name];
  if (file == null) {
    res.status(404).send('File `${name}` not found.');
    return;

  }

  res.download(file);
}

//=========================================================
// ROM scanning
//=========================================================

function scanROMs() {
  console.log(`Scanning "${ROMS_DIR}" directory`);

  romList = [];
  romMap = {};
  romFiles = {};

  for (var file of fs.readdirSync(ROMS_DIR)) {
    if (!(isROM(file))) {
      continue;
    }

    var id = getROMId(file);
    var name = getROMName(file);
    var fileName = path.basename(file);
    var fileURL = `/files/${fileName}`;
    var thumbnail = findROMThunbnail(file);
    var thumbnailName = thumbnail ? path.basename(thumbnail) : null;
    var thumbnailURL = thumbnail ? `/files/${thumbnailName}` : null;
    var rom = { id, name, fileURL, thumbnailURL };

    romList.push(rom);
    romMap[id] = rom;
    romFiles[fileName] = path.join(ROMS_DIR, file);

    if (thumbnail) {
      romFiles[thumbnailName] = path.join(ROMS_DIR, thumbnail);
    }
  }

  romList.sort(compareROMs);

  console.log(`Found ${romList.length} ROMs`);
};

function isROM(file) {
  return file.slice(-4).toLowerCase() === '.nes';
}

function getROMId(file) {
  return file.replace(/\.nes$/i, '')
         .replace(/[^a-zA-Z0-9]+/g, '-')
         .replace(/^-/, '')
         .replace(/-$/, '')
         .toLowerCase();
}

function getROMName(file) {
  return file.replace(/\.nes$/i, '');
}

function findROMThunbnail(file) {
  for (var ext of ['png', 'git', 'jpg', 'jpeg']) {
    var thumbnailFile = file.replace(/\.nes$/i, `.${ext}`);
    var thumbnailPath = path.join(ROMS_DIR, thumbnailFile);
    if (fs.existsSync(thumbnailPath)) {
      return thumbnailFile;
    }
  }
  return null;
}

function compareROMs(rom1, rom2) {
  var name1 = rom1.name.replace(/^The /i, '');
  var name2 = rom2.name.replace(/^The /i, '');
  return name1.localeCompare(name2);
}

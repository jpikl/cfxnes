import fs from 'fs';
import path from 'path';

var romDir = path.join(__dirname, 'roms');
var romList = [];
var romMap = {};
var fileMap = {};
var scanTimer;

//=========================================================
// API
//=========================================================

export function start() {
  if (!fs.existsSync(romDir)) {
    fs.mkdirSync(romDir);
  }
  fs.watch(romDir, refresh);
  refresh();
}

export function list(req, res) {
  res.json(romList);
}

export function get(req, res) {
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

export function download(req, res) {
  var name = req.params.name;
  if (name == null) {
    res.status(400).send('Missing filename.');
    return;
  }

  var file = fileMap[name];
  if (file == null) {
    res.status(404).send('File `${name}` not found.');
    return;

  }

  res.download(file, name);
}

//=========================================================
// Scanning
//=========================================================

function refresh() {
  clearTimeout(scanTimer);
  scanTimer = setTimeout(scan, 1000);
}

function scan() {
  console.log(`Scanning "${romDir}" directory`);

  romList = [];
  romMap = {};
  fileMap = {};

  for (var file of fs.readdirSync(romDir)) {
    if (path.extname(file).toLowerCase() !== '.nes') {
      continue;
    }

    var id = makeId(file);
    var name = makeName(file);
    var fileId = makeFileId(file);
    var fileURL = `/files/${fileId}`;
    var thumbnail = findThumbnail(file);
    var thumbnailId = thumbnail ? makeFileId(thumbnail) : null;
    var thumbnailURL = thumbnail ? `/files/${thumbnailId}` : null;
    var rom = {id, name, fileURL, thumbnailURL};

    romList.push(rom);
    romMap[id] = rom;
    fileMap[fileId] = path.join(romDir, file);

    if (thumbnail) {
      fileMap[thumbnailId] = path.join(romDir, thumbnail);
    }
  }

  romList.sort(compare);

  console.log(`Found ${romList.length} ROMs`);
};

function makeId(file) {
  return path.basename(file, path.extname(file))
         .replace(/[ _\-]+/g, ' ').trim()
         .replace(/[^a-zA-Z0-9 ]+/g, '')
         .replace(/ +/g, '-')
         .toLowerCase();
}

function makeFileId(file) {
  var ext = path.extname(file);
  return path.basename(file, ext)
         .replace(/[ _\-]+/g, ' ').trim()
         .replace(/[^a-zA-Z0-9 ]+/g, '')
         .replace(/ +/g, '_') + ext;
}

function makeName(file) {
  return path.basename(file, path.extname(file)).trim();
}

function findThumbnail(file) {
  for (var ext of ['png', 'git', 'jpg', 'jpeg']) {
    var thumbnailFile = file.replace(/\.nes$/i, `.${ext}`);
    var thumbnailPath = path.join(romDir, thumbnailFile);
    if (fs.existsSync(thumbnailPath)) {
      return thumbnailFile;
    }
  }
  return null;
}

function compare(rom1, rom2) {
  var name1 = rom1.name.replace(/^The /i, '');
  var name2 = rom2.name.replace(/^The /i, '');
  return name1.localeCompare(name2);
}

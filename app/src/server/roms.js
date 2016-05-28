/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

const romDir = path.join(__dirname, 'roms');
let romList = [];
let romMap = {};
let fileMap = {};
let scanTimer;

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
  const id = req.params.id;
  if (id == null) {
    res.status(400).send('Missing ROM ID.');
    return;
  }

  const rom = romMap[id];
  if (rom == null) {
    res.status(404).send(`ROM with ID ${id} not found.`);
    return;
  }

  res.json(rom);
}

export function download(req, res) {
  const name = req.params.name;
  if (name == null) {
    res.status(400).send('Missing filename.');
    return;
  }

  const file = fileMap[name];
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

  for (const file of fs.readdirSync(romDir)) {
    if (path.extname(file).toLowerCase() !== '.nes') {
      continue;
    }

    const id = makeId(file);
    const name = makeName(file);
    const fileId = makeFileId(file);
    const fileURL = `/files/${fileId}`;
    const thumbnail = findThumbnail(file);
    const thumbnailId = thumbnail ? makeFileId(thumbnail) : null;
    const thumbnailURL = thumbnail ? `/files/${thumbnailId}` : null;
    const rom = {id, name, fileURL, thumbnailURL};

    romList.push(rom);
    romMap[id] = rom;
    fileMap[fileId] = path.join(romDir, file);

    if (thumbnail) {
      fileMap[thumbnailId] = path.join(romDir, thumbnail);
    }
  }

  romList.sort(compare);

  console.log(`Found ${romList.length} ROMs`);
}

function makeId(file) {
  return path.basename(file, path.extname(file))
         .replace(/[ _\-]+/g, ' ').trim()
         .replace(/[^a-zA-Z0-9 ]+/g, '')
         .replace(/ +/g, '-')
         .toLowerCase();
}

function makeFileId(file) {
  const ext = path.extname(file);
  return path.basename(file, ext)
         .replace(/[ _\-]+/g, ' ').trim()
         .replace(/[^a-zA-Z0-9 ]+/g, '')
         .replace(/ +/g, '_') + ext;
}

function makeName(file) {
  return path.basename(file, path.extname(file)).trim();
}

function findThumbnail(file) {
  for (const ext of ['png', 'git', 'jpg', 'jpeg']) {
    const imageFile = file.replace(/\.nes$/i, `.${ext}`);
    if (fs.existsSync(path.join(romDir, imageFile))) {
      return imageFile;
    }
  }
  return null;
}

function compare(rom1, rom2) {
  const name1 = rom1.name.replace(/^The /i, '');
  const name2 = rom2.name.replace(/^The /i, '');
  return name1.localeCompare(name2);
}

import {Router as newRouter} from 'express';
import {ObjectNotFoundError} from '../common';
import {ROMS_PATH, ROMS_FILES_PATH} from '../routes';

export default function createRouter(romDb) {
  const router = newRouter({caseSensitive: true, strict: true});

  router.get(`${ROMS_PATH}/`, (req, res) => {
    res.json(romDb.getRoms());
  });

  router.get(`${ROMS_PATH}/:id`, (req, res) => {
    const {id} = req.params;
    const rom = romDb.getRom(id);
    if (rom == null) {
      throw new ObjectNotFoundError(`ROM ${id} not found.`);
    }
    res.json(rom);
  });

  router.get(`${ROMS_FILES_PATH}/:name`, (req, res) => {
    const {name} = req.params;
    const file = romDb.getFile(name);
    if (file == null) {
      throw new ObjectNotFoundError(`File ${name} not found.`);
    }
    res.sendFile(file);
  });

  return router;
}

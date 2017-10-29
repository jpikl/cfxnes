import {Router as newRouter} from 'express';
import {ROMS_PATH, ROMS_FILES_PATH} from '../routes';

export default function createRouter(romDb) {
  const router = newRouter();

  router.get(ROMS_PATH, (req, res) => {
    res.json(romDb.getRoms());
  });

  router.get(`${ROMS_PATH}/:id`, (req, res) => {
    const {id} = req.params;
    if (id == null) {
      res.status(400).send('Missing ROM ID.');
      return;
    }

    const rom = romDb.getRom(id);
    if (rom == null) {
      res.status(404).send(`ROM with ID ${id} not found.`);
      return;
    }

    res.json(rom);
  });

  router.get(`${ROMS_FILES_PATH}/:name`, (req, res) => {
    const {name} = req.params;
    if (name == null) {
      res.status(400).send('Missing filename.');
      return;
    }

    const file = romDb.getFile(name);
    if (file == null) {
      res.status(404).send(`File ${name} not found.`);
      return;
    }

    res.sendFile(file);
  });

  return router;
}

import {log} from '../common';
import {RomDB} from './roms';
import {getConfig} from './config';
import createApp from './createApp';
import createServer from './createServer';

const config = getConfig();

log.setLevel(config.logLevel);
log.info(config);

const romDb = new RomDB(config.romsPath);
const app = createApp(romDb, config);
const server = createServer(app, config);

server.listen(config.port);
romDb.start();

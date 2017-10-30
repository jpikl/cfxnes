import {log} from '../common';
import {RomDb} from './roms';
import {getConfig} from './config';
import createApp from './createApp';
import createServer from './createServer';

const config = getConfig();

log.setLevel(config.logLevel);

const romDb = new RomDb(config.romsPath);
const app = createApp(romDb, config);
const server = createServer(app, config);

server.listen(config.port);
romDb.start();

import http from 'http';
import {log} from '../common';
import {RomDb} from './roms';
import {getConfig} from './config';
import createApp from './createApp';

const config = getConfig();

log.setLevel(config.logLevel);

const romDb = new RomDb(config.romsPath);
const app = createApp(romDb, config);
const server = http.createServer(app);

server.listen(config.port);
romDb.start();

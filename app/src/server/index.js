import {log} from '../common';
import {RomDB} from './roms';
import {getConfig, printConfig} from './config';
import createApp from './createApp';
import createServer from './createServer';

const config = getConfig();
printConfig(config, process.stdout);

log.setLevel(config.logLevel);

const romDb = new RomDB(config.romsPath);
const app = createApp(romDb, config);
const server = createServer(app, config);

server.listen(config.port);
romDb.start();

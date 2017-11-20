import {resolvePath} from '../common';
import {LogLevel} from '../../common';

export default {
  port: 5000, // Server port
  logLevel: LogLevel.OFF, // Log level (off/error/warn/info)
  morganEnabled: false, // Enables HTTP requests logging through morgan
  morganFormat: 'dev', // Morgan output format
  staticPath: resolvePath('static'), // Path to a directory with static resources
  romsPath: resolvePath('roms'), // Path to a directory with ROMs
  trustProxy: false, // Express 'trust proxy' property
  httpsRedirect: false, // Enables HTTPS redirect
};

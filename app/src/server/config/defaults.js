import {resolvePath} from '../common';
import {LogLevel} from '../../common';

export default {
  port: 5000, // Application port
  logLevel: LogLevel.OFF, // Log level (off/error/warn/info)
  morganEnabled: false, // Enables logging of HTTP requests through morgan
  morganFormat: 'dev', // Morgan output format
  staticPath: resolvePath('static'), // Path to a directory with static resources
  romsPath: resolvePath('roms'), // Path to a directory with ROMs
  http2Enabled: false, // Enables HTTP2
  tlsEnabled: false, // Enables HTTP over TLS
  tlsKeyPath: resolvePath('key.pem'), // Path to TLS key
  tlsCertPath: resolvePath('cert.pem'), // Path to TLS certificate
};

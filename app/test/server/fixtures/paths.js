import path from 'path';

export const NON_EXISTENT_PATH = path.resolve(__dirname, '_');
export const DATA_PATH = path.resolve(__dirname, 'data');

export const STATIC_PATH = path.resolve(DATA_PATH, 'static');
export const ROMS_PATH = path.resolve(DATA_PATH, 'roms');
export const TLS_KEY_PATH = path.resolve(DATA_PATH, 'key.pem');
export const TLS_CERT_PATH = path.resolve(DATA_PATH, 'cert.pem');
export const INVALID_JSON_PATH = path.resolve(DATA_PATH, 'invalid.json');
export const STRING_JSON_PATH = path.resolve(DATA_PATH, 'string.json');
export const OBJECT_JSON_PATH = path.resolve(DATA_PATH, 'object.json');

export const INDEX_HTML_PATH = path.resolve(STATIC_PATH, 'index.html');
export const BUNDLE_CSS_PATH = path.resolve(STATIC_PATH, 'bundle.css');

export const NESTEST_ROM_PATH = path.resolve(ROMS_PATH, 'NES Test.nes');
export const NESTEST_THUMB_PATH = path.resolve(ROMS_PATH, 'NES Test.jpg');
export const NESTRESS_ROM_PATH = path.resolve(ROMS_PATH, 'NEStress.NES');

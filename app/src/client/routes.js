export const EMULATOR = 'emulator';
export const LIBRARY = 'library';
export const SETTINGS = 'settings';
export const ABOUT = 'about';

export const ROM_ID = 'romId';
export const ACTIVE_PANEL_ID = 'activePanelId';

const join = (...parts) => parts.join('/');
const joinOptional = (path, param) => (param ? join(path, param) : path);
const optional = param => `:${param}?`;

export const ROOT_PATH = '';
export const EMULATOR_PATH = join(ROOT_PATH, EMULATOR);
export const LIBRARY_PATH = join(ROOT_PATH, LIBRARY);
export const SETTINGS_PATH = join(ROOT_PATH, SETTINGS);
export const ABOUT_PATH = join(ROOT_PATH, ABOUT);

export const ROOT_EXPR = join(ROOT_PATH, '');
export const NON_ROOT_EXPR = join(ROOT_PATH, '(.+)');
export const EMULATOR_EXPR = join(EMULATOR_PATH, optional(ROM_ID));
export const LIBRARY_EXPR = LIBRARY_PATH;
export const SETTINGS_EXPR = join(SETTINGS_PATH, optional(ACTIVE_PANEL_ID));
export const ABOUT_EXPR = ABOUT_PATH;

export const getEmulatorPath = romId => joinOptional(EMULATOR_PATH, romId);
export const getSettingsPath = activePanelId => joinOptional(SETTINGS_PATH, activePanelId);

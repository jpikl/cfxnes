import partial from 'lodash-es/partial';

const EMULATOR = 'emulator';
const LIBRARY = 'library';
const SETTINGS = 'settings';
const ABOUT = 'about';

export const ROM_ID = 'romId';
export const ACTIVE_PANEL_ID = 'activePanelId';

export const createPath = (...parts) => '/' + parts.join('/');
export const createOptParam = name => `:${name}?`;

export const getEmulatorPath = partial(createPath, EMULATOR);
export const getLibraryPath = partial(createPath, LIBRARY);
export const getSettingsPath = partial(createPath, SETTINGS);
export const getAboutPath = partial(createPath, ABOUT);

export const ROOT_PATH = createPath();
export const NON_ROOT_PATH = createPath('(.+)');
export const EMULATOR_PATH = getEmulatorPath(createOptParam(ROM_ID));
export const LIBRARY_PATH = getLibraryPath();
export const SETTINGS_PATH = getSettingsPath(createOptParam(ACTIVE_PANEL_ID));
export const ABOUT_PATH = getAboutPath();

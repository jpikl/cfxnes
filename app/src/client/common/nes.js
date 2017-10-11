import JSZip from 'jszip/dist/jszip.min';
import cfxnes from 'cfxnes';

cfxnes.logLevel = __LOG_LEVEL__;

export const nes = cfxnes({JSZip});
export const nesDefaults = nes.config.get();

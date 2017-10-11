import {combineReducers} from 'redux';
import database from './database';
import emulator from './emulator';
import library from './library';
import settings, {selectValues} from './settings';

export const selectDatabase = state => state.database;
export const selectEmulator = state => state.emulator;
export const selectLibrary = state => state.library;
export const selectSettings = state => state.settings;
export const selectSettingsValues = state => selectValues(selectSettings(state));

export default combineReducers({database, emulator, library, settings});

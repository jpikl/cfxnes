import {resolvePath} from '../common';
import defaults from './defaults';
import load from './load';
import merge from './merge';

export function getConfig() {
  const config = load(resolvePath('config.json'));
  return merge(process.env, config, defaults);
}

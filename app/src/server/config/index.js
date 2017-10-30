import {resolvePath} from '../common';
import defaults from './defaults';
import load from './load';
import merge from './merge';

export function getConfig() {
  const config = load(resolvePath('cfg.json'));
  return merge(process.env, config, defaults);
}

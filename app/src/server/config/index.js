import {resolvePath} from '../common';
import defaults from './defaults';
import load from './load';
import merge from './merge';

export {default as printConfig} from './print';

export function getConfig() {
  const config = load(resolvePath('cfg.json'));
  return merge(process.env, config, defaults);
}

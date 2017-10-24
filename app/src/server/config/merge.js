import {parseBoolean} from '../common';

const constantCase = require('constant-case');

export default function merge(env, values, defaults) {
  const result = {};

  for (const key in defaults) {
    result[key] = chooseValue(env, values, defaults, key);
  }

  return result;
}

function chooseValue(env, values, defaults, key) {
  const defaultValue = defaults[key];

  const envKey = constantCase(key);
  const envValue = env[envKey];

  if (envValue !== undefined) {
    const valueType = typeof defaultValue;

    if (valueType === 'boolean') {
      return parseBoolean(envValue);
    }

    if (valueType === 'number') {
      return parseFloat(envValue);
    }

    return envValue;
  }

  const value = values[key];
  if (value !== undefined) {
    return value;
  }

  return defaultValue;
}

import fs from 'fs';

export default function load(path) {
  if (fs.existsSync(path)) {
    const data = fs.readFileSync(path, 'utf8');
    const config = parse(data);

    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration');
    }

    return config;
  }

  return {};
}

function parse(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

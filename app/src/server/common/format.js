const wordSeparatorsRegExp = /[ _-]+/g;
const whiteSpacesRegExp = / +/g;
const unsafeCharsRegExp = /[^a-zA-Z0-9 ]+/g;

export function makeId(name) {
  return name
    .replace(wordSeparatorsRegExp, ' ')
    .replace(unsafeCharsRegExp, '')
    .trim()
    .replace(whiteSpacesRegExp, '-')
    .toLowerCase();
}

export function sanitizeName(name) {
  return name
    .replace(wordSeparatorsRegExp, ' ')
    .replace(unsafeCharsRegExp, '')
    .trim()
    .replace(whiteSpacesRegExp, '_');
}

export function makeSeparator(char, length, title) {
  const header = title ? `[${title}]` : '';
  const diff = Math.max(0, ~~((length - header.length) / 2));
  const part = char.repeat(diff);
  return part + header + part;
}

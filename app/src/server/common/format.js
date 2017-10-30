const wordSeparatorsRegExp = /[ _-]+/g;
const whiteSpacesRegExp = / +/g;
const unsafeCharsRegExp = /[^a-zA-Z0-9 ]+/g;

export function createId(name) {
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

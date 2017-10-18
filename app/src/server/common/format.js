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

export function removePrefix(value, prefix, caseInsensitive) {
  let actualPrefix = value.substr(0, prefix.length);

  if (caseInsensitive) {
    actualPrefix = actualPrefix.toLowerCase();
    prefix = prefix.toLowerCase();
  }

  if (actualPrefix === prefix) {
    return value.substr(prefix.length);
  }

  return value;
}

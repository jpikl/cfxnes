/* global window, Buffer */

/**
 * Decodes Base64 string value.
 * @param {string} input Encoded value.
 * @return {string} Decoded value.
 */
export default function decodeBase64(input) {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(input);
  }
  if (typeof Buffer === 'function') {
    return Buffer.from(input, 'base64').toString('binary');
  }
  throw new Error('Unable to decode base64 string');
}

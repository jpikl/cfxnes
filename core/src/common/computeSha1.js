const hexChars = '0123456789abcdef'.split('');
const extra = [-2147483648, 8388608, 32768, 128];
const shift = [24, 16, 8, 0];

/**
 * Computes SHA-1 hash of a byte array.
 * Based on source code of [js-sha1 v3.0]{@link https://github.com/emn178/js-sha1}.
 * @param {!Uint8Array} data Input data.
 * @return {string} SHA-1 hash of input data.
 */
export default function computeSha1(data) {
  const {length} = data;
  const blocks = new Array(17);

  let block = 0;
  let index = 0;
  let start = 0;
  let bytes = 0;
  let end = false;
  let t, f, i, j;
  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;
  let h4 = 0xC3D2E1F0;

  do {
    blocks[0] = block;
    blocks.fill(0, 1, 17);

    for (i = start; index < length && i < 64; index++) {
      blocks[i >> 2] |= data[index] << shift[i++ & 3];
    }

    bytes += i - start;
    start = i - 64;
    if (index === length) {
      blocks[i >> 2] |= extra[i & 3];
      index++;
    }
    block = blocks[16];
    if (index > length && i < 56) {
      blocks[15] = bytes << 3;
      end = true;
    }

    for (j = 16; j < 80; j++) {
      t = blocks[j - 3] ^ blocks[j - 8] ^ blocks[j - 14] ^ blocks[j - 16];
      blocks[j] = (t << 1) | (t >>> 31);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;

    for (j = 0; j < 20; j += 5) {
      f = (b & c) | ((~b) & d);
      t = (a << 5) | (a >>> 27);
      e = t + f + e + 1518500249 + blocks[j] << 0;
      b = (b << 30) | (b >>> 2);

      f = (a & b) | ((~a) & c);
      t = (e << 5) | (e >>> 27);
      d = t + f + d + 1518500249 + blocks[j + 1] << 0;
      a = (a << 30) | (a >>> 2);

      f = (e & a) | ((~e) & b);
      t = (d << 5) | (d >>> 27);
      c = t + f + c + 1518500249 + blocks[j + 2] << 0;
      e = (e << 30) | (e >>> 2);

      f = (d & e) | ((~d) & a);
      t = (c << 5) | (c >>> 27);
      b = t + f + b + 1518500249 + blocks[j + 3] << 0;
      d = (d << 30) | (d >>> 2);

      f = (c & d) | ((~c) & e);
      t = (b << 5) | (b >>> 27);
      a = t + f + a + 1518500249 + blocks[j + 4] << 0;
      c = (c << 30) | (c >>> 2);
    }

    for (; j < 40; j += 5) {
      f = b ^ c ^ d;
      t = (a << 5) | (a >>> 27);
      e = t + f + e + 1859775393 + blocks[j] << 0;
      b = (b << 30) | (b >>> 2);

      f = a ^ b ^ c;
      t = (e << 5) | (e >>> 27);
      d = t + f + d + 1859775393 + blocks[j + 1] << 0;
      a = (a << 30) | (a >>> 2);

      f = e ^ a ^ b;
      t = (d << 5) | (d >>> 27);
      c = t + f + c + 1859775393 + blocks[j + 2] << 0;
      e = (e << 30) | (e >>> 2);

      f = d ^ e ^ a;
      t = (c << 5) | (c >>> 27);
      b = t + f + b + 1859775393 + blocks[j + 3] << 0;
      d = (d << 30) | (d >>> 2);

      f = c ^ d ^ e;
      t = (b << 5) | (b >>> 27);
      a = t + f + a + 1859775393 + blocks[j + 4] << 0;
      c = (c << 30) | (c >>> 2);
    }

    for (; j < 60; j += 5) {
      f = (b & c) | (b & d) | (c & d);
      t = (a << 5) | (a >>> 27);
      e = t + f + e - 1894007588 + blocks[j] << 0;
      b = (b << 30) | (b >>> 2);

      f = (a & b) | (a & c) | (b & c);
      t = (e << 5) | (e >>> 27);
      d = t + f + d - 1894007588 + blocks[j + 1] << 0;
      a = (a << 30) | (a >>> 2);

      f = (e & a) | (e & b) | (a & b);
      t = (d << 5) | (d >>> 27);
      c = t + f + c - 1894007588 + blocks[j + 2] << 0;
      e = (e << 30) | (e >>> 2);

      f = (d & e) | (d & a) | (e & a);
      t = (c << 5) | (c >>> 27);
      b = t + f + b - 1894007588 + blocks[j + 3] << 0;
      d = (d << 30) | (d >>> 2);

      f = (c & d) | (c & e) | (d & e);
      t = (b << 5) | (b >>> 27);
      a = t + f + a - 1894007588 + blocks[j + 4] << 0;
      c = (c << 30) | (c >>> 2);
    }

    for (; j < 80; j += 5) {
      f = b ^ c ^ d;
      t = (a << 5) | (a >>> 27);
      e = t + f + e - 899497514 + blocks[j] << 0;
      b = (b << 30) | (b >>> 2);

      f = a ^ b ^ c;
      t = (e << 5) | (e >>> 27);
      d = t + f + d - 899497514 + blocks[j + 1] << 0;
      a = (a << 30) | (a >>> 2);

      f = e ^ a ^ b;
      t = (d << 5) | (d >>> 27);
      c = t + f + c - 899497514 + blocks[j + 2] << 0;
      e = (e << 30) | (e >>> 2);

      f = d ^ e ^ a;
      t = (c << 5) | (c >>> 27);
      b = t + f + b - 899497514 + blocks[j + 3] << 0;
      d = (d << 30) | (d >>> 2);

      f = c ^ d ^ e;
      t = (b << 5) | (b >>> 27);
      a = t + f + a - 899497514 + blocks[j + 4] << 0;
      c = (c << 30) | (c >>> 2);
    }

    h0 = h0 + a << 0;
    h1 = h1 + b << 0;
    h2 = h2 + c << 0;
    h3 = h3 + d << 0;
    h4 = h4 + e << 0;
  } while (!end);

  return hexChars[(h0 >> 28) & 0x0F] + hexChars[(h0 >> 24) & 0x0F]
       + hexChars[(h0 >> 20) & 0x0F] + hexChars[(h0 >> 16) & 0x0F]
       + hexChars[(h0 >> 12) & 0x0F] + hexChars[(h0 >> 8) & 0x0F]
       + hexChars[(h0 >> 4) & 0x0F] + hexChars[h0 & 0x0F]
       + hexChars[(h1 >> 28) & 0x0F] + hexChars[(h1 >> 24) & 0x0F]
       + hexChars[(h1 >> 20) & 0x0F] + hexChars[(h1 >> 16) & 0x0F]
       + hexChars[(h1 >> 12) & 0x0F] + hexChars[(h1 >> 8) & 0x0F]
       + hexChars[(h1 >> 4) & 0x0F] + hexChars[h1 & 0x0F]
       + hexChars[(h2 >> 28) & 0x0F] + hexChars[(h2 >> 24) & 0x0F]
       + hexChars[(h2 >> 20) & 0x0F] + hexChars[(h2 >> 16) & 0x0F]
       + hexChars[(h2 >> 12) & 0x0F] + hexChars[(h2 >> 8) & 0x0F]
       + hexChars[(h2 >> 4) & 0x0F] + hexChars[h2 & 0x0F]
       + hexChars[(h3 >> 28) & 0x0F] + hexChars[(h3 >> 24) & 0x0F]
       + hexChars[(h3 >> 20) & 0x0F] + hexChars[(h3 >> 16) & 0x0F]
       + hexChars[(h3 >> 12) & 0x0F] + hexChars[(h3 >> 8) & 0x0F]
       + hexChars[(h3 >> 4) & 0x0F] + hexChars[h3 & 0x0F]
       + hexChars[(h4 >> 28) & 0x0F] + hexChars[(h4 >> 24) & 0x0F]
       + hexChars[(h4 >> 20) & 0x0F] + hexChars[(h4 >> 16) & 0x0F]
       + hexChars[(h4 >> 12) & 0x0F] + hexChars[(h4 >> 8) & 0x0F]
       + hexChars[(h4 >> 4) & 0x0F] + hexChars[h4 & 0x0F];
}

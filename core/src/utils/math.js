//=========================================================
// Math utilities
//=========================================================

export function roundUpToPowerOf2(number) {
  let result = 1;
  while (result < number) {
    result *= 2;
  }
  return result;
}

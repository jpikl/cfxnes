/**
 * Returns size as formatted string with B, KB or MB units.
 * @param {number|undefined} size Size in bytes.
 * @return {string|undefined} Formatted size when size is a number, undefined otherwise.
 */
export default function formatSize(size) {
  if (typeof size !== 'number') {
    return undefined;
  }
  if (Math.abs(size) < 1024) {
    return size + ' B';
  }
  if (Math.abs(size) < 1024 * 1024) {
    return roundSize(size / 1024) + ' KB';
  }
  return roundSize(size / (1024 * 1024)) + ' MB';
}

/**
 * Rounds size to 3 decimal digits.
 * @param {number} size Size.
 * @return {number} Rounded size.
 */
function roundSize(size) {
  return (~~(1000 * size)) / 1000;
}

/**
 * @param  {string} fill  string to fill padding
 * @return {function}
 */
const padString = (fill) => (padSize, str) => {
  return (('' + str).length >= padSize)
    ? '' + str
    : (fill.repeat(padSize) + str).slice(-padSize);
};

/**
 * Pad str with 0 characters if it is shorter than padSize
 * @param  {number} padSize
 * @param  {string|number} str
 * @return {string}
 */
export const zeroPad = padString('0');

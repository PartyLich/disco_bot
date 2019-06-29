/**
 * Get a random int between 0 and max
 * @param  {Number} max maximum integer to return
 * @return {Number}     returns and integer between 0 and max
 */
export function randInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

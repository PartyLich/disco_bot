/**
 * Encode HTML entities
 * @param  {String} str string to be encoded
 * @return {String}     encoded string
 */
export function encodeEntities(str) {
  const escapeChars = {
    '¢': 'cent',
    '£': 'pound',
    '¥': 'yen',
    '€': 'euro',
    '©': 'copy',
    '®': 'reg',
    '<': 'lt',
    '>': 'gt',
    '"': 'quot',
    '&': 'amp',
    '\'': '#39',
  };

  let regexString = '[';
  for (const key in escapeChars) {
    regexString += key;
  }
  regexString += ']';

  const regex = new RegExp(regexString, 'g');

  return str.replace(regex, function (match) {
    return '&' + escapeChars[match] + ';';
  });
}

/**
 * Decode HTML entities in a String
 * https://stackoverflow.com/a/44195856/1829589
 * @param  {String} encodedString string to decode HTML entities from
 * @return {String}               the decoded string
 */
export function decodeEntities(encodedString) {
  const reTranslate = /&(nbsp|amp|quot|lt|gt);/g;
  const reNumbers = /&#(\d+);/gi;
  const translate = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>',
  };

  return encodedString
      .replace(reTranslate, (match, entity) => translate[entity])
      .replace(reNumbers, (match, numStr) => {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
      });
}

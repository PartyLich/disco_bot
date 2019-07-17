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

import {randInt} from './randInt';

export default getRandomDialog;

/**
 * Return randomly selected string from dialog array
 * @param  {Array} dialog dialog options
 * @return {string}        randomly selected dialog
 */
function getRandomDialog(dialog) {
  return `${dialog[randInt(dialog.length - 1)]}`;
}

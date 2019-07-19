import {randInt} from './randInt';

export default getRandomDialog;

function getRandomDialog(dialog) {
  return `${dialog[randInt(dialog.length - 1)]}`;
}

import {DIALOG} from '../dialog.json';
import {randInt} from '../randInt.js';

const name = 'repeat';
const description = 'Repeat the current song';

export {
  name,
  description,
  execute,
};

/**
 * Repeat the current song
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
function execute(message, {serverQueue, args} = {}) {
  if (!(serverQueue && serverQueue.songs)) {
    message.channel.send(
        `There's no song to repeat ${message.author.username}.`
    );
    return;
  }

  const dialog = DIALOG.repeat;
  const song = serverQueue.songs[0];

  serverQueue.songs.unshift(song);
  return message.channel.send(
      `${dialog[randInt(dialog.length - 1)]} repeating ${song.title} for ${
        message.author.username
      }`
  );
}
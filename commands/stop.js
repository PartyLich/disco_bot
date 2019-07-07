import {DIALOG} from '../dialog.json';
import {randInt} from '../randInt.js';

const name = 'stop';
const description = 'End playback of current song and clear queue';

export {name, description, execute};

/**
 * End playback of current song and clear queue
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @param  {Array} args    arguments supplied with the command
 * @return {Promise}             Promise for the bot's reply message
 */
function execute(message, {serverQueue, args} = {}) {
  // function stop(message, serverQueue) {
  if (!message.member.voiceChannel) {
    return message.channel.send(
        'You have to be in a voice channel to stop the music!'
    );
  }
  if (!serverQueue) {
    const dialog = DIALOG.stopNoQueue;
    return message.channel.send(
        `${dialog[randInt(dialog.length - 1)]} (There is no song to stop)`
    );
  }

  const dialog = DIALOG.stop;
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();

  return message.channel.send(
      `${dialog[randInt(dialog.length - 1)]} (playback stopped)`
  );
}

import {DIALOG} from '../dialog.json';
import {randInt} from '../randInt.js';
import send from '../sendText';

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
  const {channel} = message;
  if (!message.member.voiceChannel) {
    return send(channel,
        'You have to be in a voice channel to stop the music!'
    );
  }
  if (!serverQueue) {
    const dialog = DIALOG.stopNoQueue;
    return send(channel,
        `${dialog[randInt(dialog.length - 1)]} (There is no song to stop)`
    );
  }

  const dialog = DIALOG.stop;
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();

  return send(channel,
      `${dialog[randInt(dialog.length - 1)]} (playback stopped)`
  );
}

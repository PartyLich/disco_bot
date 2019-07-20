import {DIALOG} from '../dialog.json';
import getRandomDialog from '../getRandomDialog';
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
    const dialog = () => getRandomDialog(DIALOG.stopNoQueue);
    return send(channel,
        `${dialog()} (There is no song to stop)`
    );
  }

  const dialog = () => getRandomDialog(DIALOG.stop);
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();

  return send(channel,
      `${dialog()} (playback stopped)`
  );
}

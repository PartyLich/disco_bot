import {DIALOG} from '../dialog.json';
import getRandomDialog from '../getRandomDialog';
import send from '../sendText';

const name = 'skip';
const description = 'End playback of current song';

export {
  name,
  description,
  execute,
};

/**
 * End playback of current song
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
function execute(message, {serverQueue, args} = {}) {
  const dialog = () => getRandomDialog(DIALOG.skip);
  const {channel} = message;

  if (!message.member.voiceChannel) {
    return send(channel,
        'Can\'t stop won\'t stop! (You have to be in a voice channel to stop the music!)'
    );
  }

  if (!serverQueue) {
    return message.channel.send('There is no song that I could skip!');
  }

  serverQueue.connection.dispatcher.end();
  send(channel,
      `${dialog()} (skipping to the next song)`
  );
}

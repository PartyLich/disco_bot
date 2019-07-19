import {getSongEmbed} from '../songEmbed';
import send from '../sendText';

const name = 'next';
const description = 'Respond with the next song in the queue';

export {
  name,
  description,
  execute,
};

/**
 * Respond with the next song in the queue
 * @param  {Message}   message     The Discord message we're responding to
 * @param  {Object}   serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
function execute({channel}, {serverQueue: {songs = []} = {}, args} = {}) {
  if (songs.length < 2) {
    return send(channel, `There's nothing else in the queue.`);
  }

  return send(channel,
      'Here\'s what\'s next:' +
      getSongEmbed(songs[1], 'next')
  );
}

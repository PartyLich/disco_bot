import {getSongEmbed} from '../songEmbed';

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
function execute(message, {serverQueue: {songs = []} = {}, args} = {}) {
  if (songs.length < 2) {
    return message.channel.send(`There's nothing else in the queue.`);
  }

  return message.channel.send(
      'Here\'s what\'s next:',
      getSongEmbed(songs[1], 'next')
  );
}

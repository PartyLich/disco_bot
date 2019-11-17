import {getSongEmbed} from '../songEmbed';
import send from '../sendText';

const name = 'current';
const description = 'Display currently playing song info';
const alias = [
  'dafuqisthis',
  'songname',
  'newsongwhodis',
  'now',
];

export {
  name,
  description,
  alias,
  execute,
};

/**
 * Display currently playing song info
 * @param  {Message}   message     The Discord message we're responding to
 * @param  {Object}   serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
function execute({channel}, {serverQueue: {songs = []} = {}, args} = {}) {
  if (songs.length < 1) {
    return send(channel, `There's nothing in the queue.`);
  }

  return send(channel, getSongEmbed(songs[0], 'now'));
}

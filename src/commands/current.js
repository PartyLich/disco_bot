import {getSongEmbed} from '../songEmbed';

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
function execute(message, {serverQueue: {songs = []} = {}, args} = {}) {
  if (songs.length < 1) {
    return message.channel.send(`There's nothing in the queue.`);
  }

  return message.channel.send(getSongEmbed(songs[0], 'now'));
}

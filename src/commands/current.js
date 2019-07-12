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

function execute(message, {serverQueue: {songs = []}, args} = {}) {
  if (songs.length < 1) {
    return message.channel.send(`There's nothing in the queue.`);
  }

  return message.channel.send(getSongEmbed(songs[0], 'now'));
}

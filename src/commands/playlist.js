import {RichEmbed} from 'discord.js';
import send from '../sendText';

const name = 'playlist';
const description = 'Display the upcoming songs in the queue';
const alias = ['queue'];

export {
  name,
  description,
  alias,
  execute,
};

/**
 * Display the upcoming songs in the queue
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
function execute({channel}, {serverQueue: {songs = []}, args} = {}) {
  const embed = new RichEmbed().setTitle('Upcoming songs');
  const list = [];

  for (let i = 0, len = songs.length; i < len && i < 5; i++) {
    const title =
      (songs[i].url != '')
        ? `[${songs[i].title}](${songs[i].url})`
        : songs[i].title;
    list.push(`${i + 1}. ${title}  ${songs[i].length}`);
  }

  if (songs.length > 5) {
    list.push(`...and ${songs.length - 5} more songs`);
  }
  embed.setDescription(list.join('\n'));
  embed.setTimestamp();

  return send(channel, embed);
}

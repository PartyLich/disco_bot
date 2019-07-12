import Discord from 'discord.js';

const name = 'playlist';
const description = 'Display the upcoming songs in the queue';
const alias = ['queue'];

export {
  name,
  description,
  alias,
  execute,
};

function execute(message, {serverQueue: {songs = []}, args} = {}) {
  const embed = new Discord.RichEmbed().setTitle('Upcoming songs');
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

  return message.channel.send(embed);
}

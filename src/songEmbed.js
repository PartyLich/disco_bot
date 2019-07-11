import Discord from 'discord.js';
import {DIALOG} from './dialog.json';
import {randInt} from './randInt.js';

export function getSongEmbed(song, action) {
  if (!song) return null;

  const dialog = DIALOG.play;
  const embed = new Discord.RichEmbed();
  const info = {};

  embed.setTitle(song.title);
  embed.setURL(song.url);
  switch (action) {
    case 'queue':
      info.title = `${dialog[randInt(dialog.length - 1)]}`;
      info.description = `Song has been added to the queue!`;
      break;

    case 'next':
      info.title = `${dialog[randInt(dialog.length - 1)]}`;
      info.description = `Coming up next!`;
      break;

    default:
  }
  embed.addField(info.title, info.description, true);
  embed.addField('Length', song.length, true);
  embed.setTimestamp();

  return embed;
}

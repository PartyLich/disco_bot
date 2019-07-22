import Discord from 'discord.js';
import {issueTrackerUrl, donateUrl} from '../config.json';

const name = 'donate';
const description = 'Display info on supporting the project';
const alias = ['support'];
const secret = true;

export {
  name,
  description,
  alias,
  execute,
  secret,
};

function execute(message) {
  const embed = new Discord.RichEmbed().setTitle('Supporting Lucio:');

  embed.addField('Kind words', 'No really, a few kinds words are genuinely appreciated.', false);
  embed.addField('Ideas', `Have a feature you'd like to see? Send it my way via the [issue tracker](${issueTrackerUrl})`, false);
  embed.addField('Cash?', `[Buy me a coffee!](${donateUrl}) Not sure why you would, but I'll certainly enjoy it.\n`, false);
  embed.setTimestamp();

  return message.reply('if you\'d like to buy the dev a coffee, this should help:', embed);
}

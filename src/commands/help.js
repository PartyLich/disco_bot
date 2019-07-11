import {prefix} from '../config.json';

const name = 'help';
const description = 'A list of the commands you can give me.';
const alias = ['halp'];

export {
  name,
  description,
  alias,
  execute,
};

/**
 * List available commands
 * @param  {Message} message     The Discord message we're responding to
 * @return {Promise}             Promise for the bot's reply message
 */
function execute(message) {
  const {commands} = message.client;
  const user = message.member.nickname;
  const commandList = [];

  // build output string
  commandList.push(`**${user}**, I can do the following:`);
  commandList.push('```bash');

  for (const [, command] of commands) {
    commandList.push(`${prefix + command.name} ${command.description}`);
    if (command.alias) commandList.push(`  Aliases: ${command.alias}`);
    if (command.usage) commandList.push(`  Usage: ${prefix + command.usage}`);
  }

  commandList.push('```');

  return message.channel.send(commandList);
}

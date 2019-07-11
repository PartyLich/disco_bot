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
  const commandList = [
    `${message.author.username}, I can do the following:`,
    '```',
    `${prefix}play [youtube url]: add the specified url to the play queue`,
    `  e.g. !play`,
    `${prefix}skip: move to the next song immediately`,
    `  e.g. !skip`,
    `${prefix}stop: stop all playback`,
    `  e.g. !stop`,
    `${prefix}next: get the next song title in the queue`,
    `  e.g. !next`,
    `${prefix}repeat:  play the current song again`,
    `  e.g.!repeat`,
    `${prefix}vol [0-5, up, down]: adjust the volume`,
    `  e.g. !vol 3`,
    `${prefix}halp: The text you're reading right now! (alias: ${prefix}help)`,
    '```',
  ];

  return message.channel.send(commandList);
}

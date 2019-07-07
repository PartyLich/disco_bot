import {DIALOG} from '../dialog.json';
import {randInt} from '../randInt.js';

const name = 'vol';
const description = 'Adjust the stream volume';

export {
  name,
  description,
  execute,
};

/**
 * Adjust the stream volume
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
function execute(message, {serverQueue, args} = {}) {
  if (!serverQueue) {
    return message.channel.send(
        `There is only silence ${message.author.username}.`
    );
  }

  const dialogUp = DIALOG.volumeUp;
  const dialogDown = DIALOG.volumeDown;
  const uppers = new Set(['up', 'louder']);
  const downers = new Set(['down', 'quieter']);
  // const args = message.content.split(' ');
  const volume = parseInt(args[0]);
  const volUp = `${dialogUp[randInt(dialogUp.length - 1)]} (volume up)`;
  const volDown = `${dialogDown[randInt(dialogDown.length - 1)]} (volume down)`;

  if (isNaN(volume)) {
    if (uppers.has(args[0])) {
      serverQueue.volume = Math.min(5, serverQueue.volume + 1);
      serverQueue.connection.dispatcher.setVolumeLogarithmic(
          serverQueue.volume / 5
      );
      return message.channel.send(volUp);
    } else if (downers.has(args[0])) {
      serverQueue.volume = Math.max(0, serverQueue.volume - 1);
      serverQueue.connection.dispatcher.setVolumeLogarithmic(
          serverQueue.volume / 5
      );
      return message.channel.send(volDown);
    }
    return message.channel.send(
        `Sorry ${message.author.username}, ${args[0]} isn't a volume I understand`
    );
  }

  if (volume > 5 || volume < 0) {
    return message.channel.send(
        `Sorry ${message.author.username}, ${args[1]} must be between 0 and 5 inclusive.`
    );
  } else {
    const response = serverQueue.volume > volume ? volDown : volUp;
    serverQueue.volume = volume;
    serverQueue.connection.dispatcher.setVolumeLogarithmic(
        serverQueue.volume / 5
    );

    return message.channel.send(`${response}`);
  }
}
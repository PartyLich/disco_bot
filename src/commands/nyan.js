import ytdl from 'ytdl-core';
import Song from '../song';
import send from '../sendText';

const name = 'nyan';
const description = 'Play some sweet sweet nyan cat';
const secret = true;

export {
  name,
  description,
  execute,
  secret,
};

/**
 * Play some sweet sweet nyan cat
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue  the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
async function execute(message, {serverQueue, args = []}) {
  const NYAN_URL = 'https://youtu.be/4UdhuYsU0dM';
  const voiceChannel = message.member.voiceChannel;

  // check if user is in voice channel
  if (!voiceChannel) {
    return;
    // TODO: dm member about voice channel
  }
  const songInfo = await ytdl.getInfo(NYAN_URL);
  const song = new Song(songInfo, message.member);

  if (!serverQueue) {
    // use standard play function
    const playArgs = [NYAN_URL, args[args.length - 1]];
    standardPlay(message, serverQueue, playArgs);
  } else {
    // Pull a little sneaky on 'em
    serverQueue.songs.splice(1, 0, song);
    console.log(serverQueue.songs);

    return send(channel, getSongEmbed(song, 'queue'));
  }
}

/**
 * use standard play function to deliver the nyans
 * @param  {Object} serverQueue  the contract for our song queue
 * @param {array} args
 */
function standardPlay(message, serverQueue, args) {
  const {name: commandName} = require('./play');
  const command = message.client.commands.get(commandName);
  command.execute(message, {serverQueue, args});
}

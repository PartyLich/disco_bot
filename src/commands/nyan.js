import ytdl from 'ytdl-core';
import Song from '../song';

const name = 'nyan';
const description = 'Play some sweet sweet nyan cat';
const secret = true;

export {
  name,
  description,
  execute,
  secret,
};

async function execute(message, {serverQueue, args = []}) {
  const nyanUrl = 'https://youtu.be/4UdhuYsU0dM';
  const voiceChannel = message.member.voiceChannel;

  // check if user is in voice channel
  if (!voiceChannel) {
    return;
    // TODO: dm member about voice channel
  }

  const songInfo = await ytdl.getInfo(nyanUrl);
  const song = new Song(songInfo, message.member);

  if (!serverQueue) {
    // use standard play function
    const {name: commandName} = require('./play');
    const command = message.client.commands.get(commandName);
    const playArgs = [nyanUrl, args[args.length - 1]];
    command.execute(message, {serverQueue, args: playArgs});
  } else {
    // Pull a little sneaky on 'em
    serverQueue.songs.splice(1, 0, song);
    console.log(serverQueue.songs);

    return message.channel.send(getSongEmbed(song, 'queue'));
  }
}

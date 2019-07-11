import ytdl from 'ytdl-core';
import {DIALOG} from '../dialog.json';
import {playVoiceLine} from '../playVoiceLine.js';
import {getSongEmbed} from '../songEmbed';

const name = 'play';
const description = 'Play the requested song';
const playActivity = 'those sicc beats';
const idleActivity = 'some funky jams';

export {
  name,
  description,
  execute,
};

/**
 * Check if the user is in a voice chat and if the bot has the right permission.
 *  If not we write an error message and return.
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
async function execute(message, {serverQueue, args}) {
  const voiceChannel = message.member.voiceChannel;
  const queue = args[args.length - 1];

  // check if user is in voice channel
  if (!voiceChannel) {
    return message.channel.send(
        'You need to be in a voice channel to play music!'
    );
  }
  // check if the bot has the right permissions
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send(
        'I need the permissions to join and speak in your voice channel!'
    );
  }

  // use ytdl library to get the song information from the youtube link
  const songInfo = await ytdl.getInfo(args[0]);
  const songFile = '';
  const lenSeconds = ('00' + (songInfo.length_seconds % 60)).slice(-2);
  const lenMinutes = ('00' + Math.floor(songInfo.length_seconds / 60))
      .slice(-2);
  const lenString = `${lenMinutes}:${lenSeconds}`;

  const song = {
    title: songInfo.title,
    url: songInfo.video_url,
    file: songFile,
    length: lenString,
  };

  const dialog = DIALOG.play;

  // check if music is already playing.
  if (!serverQueue) {
    // Create the contract for our queue
    serverQueue = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null, // {VoiceConnection}
      songs: [],
      volume: 3,
      playing: true,
    };
    // Set the queue using our contract
    queue.set(message.guild.id, serverQueue);
    // add the song to list
    serverQueue.songs.push(song);

    try {
      // join the voicechat and save our connection
      const connection = await voiceChannel.join();
      console.log(`Connected to ${voiceChannel.name}!`);
      serverQueue.connection = connection;

      // Start a song
      play(message, {serverQueue, args: [serverQueue.songs[0], queue]});

      // Update bot activity
      message.client.user.setActivity(playActivity);

      return message.channel.send(
          getSongEmbed(song, 'queue')
      );
    } catch (err) {
      // Print error message if the bot fails to join the voicechat
      console.error(err);
      queue.delete(message.guild.id);
      message.client.user.setActivity(idleActivity, {type: 'LISTENING'});
      return message.channel.send(err);
    }
  } else {
    // Add the song to our existing serverQueue and send a success message.
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);

    return message.channel.send(
        getSongEmbed(song, 'queue')
    );
  }
}

/**
 * Start playback of a song
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @param  {Array} args  array of other arguments
 * @return {Promise}             Promise for the bot's reply message
 */
async function play(message, {serverQueue, args: [song, ...args]} = {}) {
  // if the song is empty, leave the voice channel and delete the queue.
  const queue = args[args.length - 1];
  if (!song) {
    await playVoiceLine(serverQueue, 'stop');

    serverQueue.voiceChannel.leave();
    message.client.user.setActivity(idleActivity, {type: 'LISTENING'});
    queue.delete(message.guild.id);
    return false;
  }

  // start playback using the playStream() function and the URL of our song.
  const opts = {filter: 'audioonly'};
  const streamOptions = {seek: 0, volume: 1};
  const songStream = ytdl(song.url, opts);
  // Play a voice line
  await playVoiceLine(serverQueue, 'play');
  let dispatcher;

  if (song.file === '') {
    dispatcher = serverQueue.connection.playStream(songStream, streamOptions);
    dispatcher.on('end', onEnd).on('error', onError);
  } else {
    dispatcher = serverQueue.connection.playFile(song.file);
    dispatcher.on('end', onEnd).on('error', onError);
  }

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

  /**
   * Play the next song and remove completed song from queue
   */
  function onEnd() {
    console.log(`Playback ended: ${song.title}`);
    serverQueue.songs.shift();
    play(message, {serverQueue, args: [serverQueue.songs[0], queue]});
  }

  /**
   * Handle error raised by dispatcher
   * @param  {String} e error that was thrown/raised
   */
  function onError(e) {
    console.error(e);
  }
}

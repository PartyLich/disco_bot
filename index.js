import fs from 'fs';
import Discord from 'discord.js';
import ytdl from 'ytdl-core';
import {prefix, token} from './config.json';
import {DIALOG} from './dialog.json';
import {randInt} from './randInt.js';
import {cleanMessage} from './cleanMessage.js';

// create client
const client = new Discord.Client();
client.login(token);

// import client commands
client.commands = new Discord.Collection();
const commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection with the key as the command name
  // and the value as the exported module
  client.commands.set(command.name, command);
  console.log(`Added command ${command.name}`);
}

// create a map with the name of the queue where we save all the songs we type
// in the chat.
const queue = new Map();

// add basic listeners
client.once('ready', () => {
  console.log('ready');
});
client.once('Reconnecting', () => {
  console.log('reconnecting');
});
client.once('disconnect', () => {
  console.log('disconnecting');
});

// message event listener
client.on('message', async (message) => {
  // dont respond if prefix is missing
  // dont respond to self
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }

  // check command to execute
  const serverQueue = queue.get(message.guild.id);
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (client.commands.has(command)) {
    try {
      client.commands.get(command).execute(message, {serverQueue, args});
      cleanMessage(message);
    } catch (e) {
      console.error(e);
      message.reply('There was an error executing that command');
    }
  }

  switch (command) {
    case `play`:
      execute(message, {serverQueue, args});
      cleanMessage(message);
      return;

    default:
  }
});

/**
 * Check if the user is in a voice chat and if the bot has the right permission.
 *  If not we write an error message and return.
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
async function execute(message, {serverQueue, args}) {
  const voiceChannel = message.member.voiceChannel;

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
  const song = {
    title: songInfo.title,
    url: songInfo.video_url,
  };

  const dialog = DIALOG.play;

  // check if music is already playing.
  if (!serverQueue) {
    // Create the contract for our queue
    const queueContract = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null, // {VoiceConnection}
      songs: [],
      volume: 5,
      playing: true,
    };
    // Set the queue using our contract
    queue.set(message.guild.id, queueContract);
    // add the song to list
    queueContract.songs.push(song);

    try {
      // join the voicechat and save our connection
      const connection = await voiceChannel.join();
      console.log(`Connected to ${voiceChannel.name}!`);
      queueContract.connection = connection;
      // Start a song
      play(message.guild, queueContract.songs[0]);

      message.channel.send(`${song.title} has been added to the queue!`);
      return message.channel.send(`${dialog[randInt(dialog.length - 1)]}`);
    } catch (err) {
      // Print error message if the bot fails to join the voicechat
      console.error(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    // Add the song to our existing serverQueue and send a success message.
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);

    message.channel.send(`${song.title} has been added to the queue!`);
    return message.channel.send(`${dialog[randInt(dialog.length - 1)]}`);
  }
}

/**
 * Start playback of a song
 * @param  {!guild} guild  The server to play in
 * @param  {!Object} song The song obj to be played
 */
function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  // if the song is empty, leave the voice channel and delete the queue.
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  // start playback using the playStream() function and the URL of our song.
  const opts = {filter: 'audioonly'};
  const streamOptions = {seek: 0, volume: 1};
  const songStream = ytdl(song.url, opts);
  const dispatcher = serverQueue.connection
      .playStream(songStream, streamOptions)
      .on('end', () => {
        console.log(`Playback ended: ${song.title}`);
        // play the next song and remove completed song from queue
        play(guild, serverQueue.songs.shift());
      })
      .on('error', (error) => {
        console.error(error);
      });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

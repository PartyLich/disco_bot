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
  const command = message.content.split(' ')[0];

  switch (command) {
    case `${prefix}play`:
      execute(message, serverQueue);
      cleanMessage(message);
      return;

    case `${prefix}repeat`:
      repeat(message, serverQueue);
      cleanMessage(message);
      return;

    case `${prefix}vol`:
      louder(message, serverQueue);
      cleanMessage(message);
      return;

    case `${prefix}halp`:
    case `${prefix}help`:
      help(message);
      cleanMessage(message);
      return;

    default:
      message.channel.send('You need to enter a valid command!');
  }
});

/**
 * Check if the user is in a voice chat and if the bot has the right permission.
 *  If not we write an error message and return.
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
async function execute(message, serverQueue) {
  const args = message.content.split(' ');
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
  const songInfo = await ytdl.getInfo(args[1]);
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

/**
 * Adjust the stream volume
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
function louder(message, serverQueue) {
  if (!serverQueue) {
    return message.channel.send(
        `There is only silence ${message.author.username}.`
    );
  }

  const dialogUp = DIALOG.volumeUp;
  const dialogDown = DIALOG.volumeDown;
  const uppers = new Set(['up', 'louder']);
  const downers = new Set(['down', 'quieter']);
  const args = message.content.split(' ');
  const volume = parseInt(args[1]);
  const volUp = `${dialogUp[randInt(dialogUp.length - 1)]} (volume up)`;
  const volDown = `${dialogDown[randInt(dialogDown.length - 1)]} (volume down)`;

  if (isNaN(volume)) {
    if (uppers.has(args[1])) {
      serverQueue.volume = Math.min(5, serverQueue.volume + 1);
      serverQueue.connection.dispatcher.setVolumeLogarithmic(
          serverQueue.volume / 5
      );
      return message.channel.send(volUp);
    } else if (downers.has(args[1])) {
      serverQueue.volume = Math.max(0, serverQueue.volume - 1);
      serverQueue.connection.dispatcher.setVolumeLogarithmic(
          serverQueue.volume / 5
      );
      return message.channel.send(volDown);
    }
    return message.channel.send(
        `Sorry ${message.author.username}, ${args[1]} isn't a volume I understand`
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

/**
 * Repeat the current song
 * @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
function repeat(message, serverQueue) {
  if (!(serverQueue && serverQueue.songs)) {
    message.channel.send(
        `There's no song to repeat ${message.author.username}.`
    );
    return;
  }

  const dialog = DIALOG.repeat;
  const song = serverQueue.songs[0];

  serverQueue.songs.unshift(song);
  return message.channel.send(
      `${dialog[randInt(dialog.length - 1)]} repeating ${song.title} for ${
        message.author.username
      }`
  );
}

/**
 * List available commands
 * @param  {Message} message     The Discord message we're responding to
 * @return {Promise}             Promise for the bot's reply message
 */
function help(message) {
  let commandList = [
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

  commandList = commandList.reduce((prev, next) => prev + '\n' + next);

  return message.channel.send(
      `${message.author.username}, I can do the following:\n${commandList}`
  );
}

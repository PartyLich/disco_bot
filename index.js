const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const {prefix, token} = require('./config.json');

// create client
const client = new Discord.Client();
client.login(token);

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

    case `${prefix}skip`:
      skip(message, serverQueue);
      cleanMessage(message);
      return;

    case `${prefix}stop`:
      stop(message, serverQueue);
      cleanMessage(message);
      return;

    case `${prefix}vol`:
      louder(message, serverQueue);
      cleanMessage(message);
      return;

    default:
      message.channel.send('You need to enter a valid command!');
  }
});

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

  // check if music is already playing.
  if (!serverQueue) {
    // Create the contract for our queue
    const queueContract = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
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

      return message.channel.send(`${song.title} has been added to the queue!`);
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
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

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

function skip(message, serverQueue) {
  if (!message.member.voiceChannel) {
    return message.channel.send(
        'Can\'t stop won\'t stop! (You have to be in a voice channel to stop the music!)'
    );
  }

  if (!serverQueue) {
    return message.channel.send('There is no song that I could skip!');
  }

  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voiceChannel) {
    return message.channel.send(
        'You have to be in a voice channel to stop the music!'
    );
  }
  if (!serverQueue) {
    return message.channel.send(
        `(There is no song to stop)`
    );
  }

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  return message.channel.send(
      `(playback stopped)`
  );
}

function louder(message, serverQueue) {
  if (!serverQueue) {
    return message.channel.send(
        `There is only silence ${message.author.username}.`
    );
  }

  const uppers = new Set(['up', 'louder']);
  const downers = new Set(['down', 'quieter']);
  const args = message.content.split(' ');
  const volume = parseInt(args[1]);
  const volUp = `(volume up)`;
  const volDown = `(volume down)`;

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
function cleanMessage(message) {
  message
      .delete()
      .then((message) =>
        console.log(`Deleted message from ${message.author.username}`)
      )
      .catch((e) => console.error(e));
}

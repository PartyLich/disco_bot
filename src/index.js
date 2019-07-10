import fs from 'fs';
import path from 'path';
import Discord from 'discord.js';
import {prefix, token} from './config.json';
import {cleanMessage} from './cleanMessage.js';

// create client
const client = new Discord.Client();
client.login(token);

// import client commands
client.commands = new Discord.Collection();
const commandFiles = fs
    .readdirSync(path.join(__dirname, '.', 'commands'))
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
  console.log('reconnecting...');
});
client.once('disconnect', () => {
  console.log('disconnecting...');
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
  const commandName = args.shift().toLowerCase();

  if (client.commands.has(commandName)) {
    try {
      args.push(queue);
      client.commands.get(commandName).execute(message, {serverQueue, args});
      cleanMessage(message);
    } catch (e) {
      console.error(e);
      message.reply('There was an error executing that command');
    }
  }
});

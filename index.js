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

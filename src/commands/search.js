import {RichEmbed} from 'discord.js';
import {searchMusic} from '../searchYoutube';
import {decodeEntities} from '../htmlEntities';

const name = 'search';
const description = 'Search youtube for a song';
const alias = ['yt'];

export {
  name,
  description,
  alias,
  execute,
};

const YOUTUBE_VID_URL = 'https://www.youtube.com/watch?v=';
const MAX_RESULTS = 5;

/**
 * Search youtube for a song
 *  @param  {Message} message     The Discord message we're responding to
 * @param  {Object} serverQueue the contract for our song queue
 * @return {Promise}             Promise for the bot's reply message
 */
async function execute(message, {serverQueue, args}) {
  if (args.length <= 1) {
    // no search term provided
    return message.channel.send('No search term provided');
  }
  console.log(`${name} command execute, args:${args}`);

  const query = args.slice(0, args.length - 1).join(' ');
  const results = await searchMusic(query, MAX_RESULTS);
  const resultList = getResultList(results, 0);

  message
      .reply(getEmbed(message.client.EMBED_COLOR, resultList));
}

/**
 * Return a formatted string for a search result
 * @param  {Number} index index of the result
 * @param  {String} title result title
 * @param  {String} id    item identifier
 * @param {Boolean} selected
 * @return {String}       formatted result string
 */
function formatResult(index, title, id, selected) {
  return selected
    ? `**${('00' + index).slice(-2)}. [${decodeURIComponent(
        decodeEntities(title)
    )}](${YOUTUBE_VID_URL + id})**`
    : `${('00' + index).slice(-2)}. [${decodeURIComponent(
        decodeEntities(title)
    )}](${YOUTUBE_VID_URL + id})`;
}

/**
 * Parse youtube search results into array of data we actually need
 * @param  {Object} results youtube search API results object
 * @param {Number}  selection index of current user selection
 * @return {Array}         array of formatted result strings
 */
function getResultList(results, selection) {
  const resultList = [];
  let i = 1;

  for (const {snippet, id} of results.items) {
    const selected = selection === i - 1;
    resultList.push(formatResult(i, snippet.title, id.videoId, selected));
    i++;
  }

  return resultList;
}

/**
 * Returns a `Discord.RichEmbed` for the given resultList array
 * @param  {String  } color      embed color
 * @param  {Array} resultList result list to display in this embed
 * @return {RichEmbed}            RichEmbed for the given resultList array
 */
function getEmbed(color, resultList) {
  const embed = new RichEmbed().setTitle('Search Results');

  embed.addField('Results', resultList.join('\n'), false);
  embed.setTimestamp();
  embed.setColor(color);

  return embed;
}

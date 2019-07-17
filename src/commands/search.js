import {RichEmbed} from 'discord.js';
import {searchMusic} from '../searchYoutube';

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

function formatResult(index, title, id, selected) {
  return selected
    ? `**${('00' + index).slice(-2)}. [${decodeURIComponent(
        title
    )}](${YOUTUBE_VID_URL + id})**`
    : `${('00' + index).slice(-2)}. [${decodeURIComponent(
        title
    )}](${YOUTUBE_VID_URL + id})`;
}

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

function getEmbed(color, resultList) {
  const embed = new RichEmbed().setTitle('Search Results');

  embed.addField('Results', resultList.join('\n'), false);
  embed.setTimestamp();
  embed.setColor(color);

  return embed;
}

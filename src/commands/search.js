import {RichEmbed} from 'discord.js';
import {searchMusic} from '../searchYoutube';
import {decodeEntities} from '../htmlEntities';
import {cleanMessage} from '../cleanMessage';

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
const NAV_UP = '🔼';
const NAV_DOWN = '🔽';
const ACCEPT = '🎵';
const CANCEL = '❌';

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
      .reply(getEmbed(message.client.EMBED_COLOR, resultList))
      .then((response) => {
        collectResponse(response, message, results)
            .then((result) => {
              const {name: commandName} = require('./play');
              const command = message.client.commands.get(commandName);
              const playArgs = [result, args[args.length - 1]];
              command.execute(message, {serverQueue, args: playArgs});
            })
            .catch((err) => console.error(err));
      });
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

  embed.setTimestamp();
  embed.setColor(color);
  if (!resultList.length) {
    return embed.addField('Results', 'No results ', false);
  } else {
    embed.addField('Results', resultList.join('\n') + ' ', false);
  }

  return embed;
}

/**
 * Decrement the selected song index
 * @param  {Message} message The Discord message we're responding to
 * @param  {Object} results youtube search API results object
 * @param {Number}  selection index of current user selection
 * @return {Number}         new selected song index
 */
function navUp({message, results, selection}) {
  if (selection >= 0) {
    selection--;
    message.edit(
        getEmbed(message.client.EMBED_COLOR, getResultList(results, selection))
    );
  }
  return selection;
}

/**
 * Increment the selected song index
 * @param  {Message} message The Discord message we're responding to
 * @param  {Object} results youtube search API results object
 * @param {Number}  selection index of current user selection
 * @return {Number}         new selected song index
 */
function navDown({message, results, selection}) {
  if (selection < MAX_RESULTS - 1) {
    selection++;
    message.edit(
        getEmbed(message.client.EMBED_COLOR, getResultList(results, selection))
    );
  }
  return selection;
}

/**
 * Respond to user song selection
 * @param {Object} args
 * @param  {Message} args.message     The Discord message we're responding to
 * @param  {ReactionCollector} args.collector  reaction collector that spawned
 *    this action
 * @param {Number}  args.selection index of current user selection
 */
function accept({message, collector, selection}) {
  message.channel.send(`Queuing it up: ${selection + 1}`);
  collector.stop(ACCEPT);
}

/**
* Stop the current search process
* @param {Object} args
* @param  {Message} args.message     The Discord message we're responding to
* @param  {ReactionCollector} args.collector  reaction collector that spawned
*    this action
*/
function cancel({message, collector}) {
  message.channel.send(`Changed your mind?`);
  collector.stop(CANCEL);
}

/**
 * Collect user input and dispatch actions
 * @param  {Message} response the bot's response message
 * @param  {Message} message  the originating message
 * @param  {Object} results youtube search API results object
 * @return {Promise}
 */
function collectResponse(response, message, results) {
  return new Promise((resolve, reject) => {
    const nav = [
      NAV_UP,
      NAV_DOWN,
      ACCEPT,
      CANCEL,
    ];
    const commands = new Map([
      [NAV_UP, navUp],
      [NAV_DOWN, navDown],
      [ACCEPT, accept],
      [CANCEL, cancel],
    ]);
    let selection = 0;

    // Prompt user with input options
    response
        .react(NAV_UP)
        .then(() => response.react(NAV_DOWN))
        .then(() => response.react(ACCEPT))
        .then(() => response.react(CANCEL))
        .catch((err) => {
          console.error(err);
          reject(err);
        });

    const filter = (reaction, user) =>
      user.id === message.author.id && nav.includes(reaction.emoji.name);
    const collectorOptions = {
      time: 90 * 1000,
    };
    const collector = response.createReactionCollector(
        filter,
        collectorOptions
    );

    collector.on('collect', (reaction, reactionCollector) => {
      console.log(`Collected ${reaction.emoji.name}, `);
      if (commands.has(reaction.emoji.name)) {
        reaction.remove(message.author);
        selection = commands.get(reaction.emoji.name)({
          message: response,
          selection,
          results,
          collector: reactionCollector,
          reaction,
        });
      }
    });

    collector.on('end', (collected, reason) => {
      console.log(`Collected ${collected.size} items`);
      if (reason === ACCEPT) {
        const result = YOUTUBE_VID_URL + results.items[selection].id.videoId;
        resolve(result);
      } else {
        cleanMessage(response);
        reject(new Error('Search canceled by user'));
      }
    });

    const reNumMatch = new RegExp(`\s?([1-${MAX_RESULTS}])[^\d]?\s?`);
    const txtFilter = (_message) =>
      _message.author.id === message.author.id &&
      reNumMatch.test(_message.content);
    const txtCollector = response.channel.createCollector(txtFilter, {
      maxMatches: 1,
      ...collectorOptions,
    });

    // Respond to user text input
    txtCollector.on('collect', (message) => {
      selection = parseInt(message.content.match(reNumMatch)[1]) - 1;
      cleanMessage(message);
      console.log(`txtCollector set selection to ${selection}`);
    });

    txtCollector.on('end', (/* collected, reason */) => {
      collector.stop(ACCEPT);
    });
  });
}

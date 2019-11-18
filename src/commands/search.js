import {RichEmbed} from 'discord.js';
import {searchMusic} from '../searchYoutube';
import {decodeEntities} from '../htmlEntities';
import {cleanMessage} from '../cleanMessage';
import send from '../sendText';

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
  const {channel} = message;
  if (args.length <= 1) {
    // no search term provided
    return send(channel, 'No search term provided');
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
 * make reaction collector
 * @param  {Message} message  the originating message
 * @param  {Message} response the bot's response message
 * @param  {object} options  collector config options
 * @return {ReactionCollector}
 */
function makeCollector(message, response, options) {
  const nav = [
    NAV_UP,
    NAV_DOWN,
    ACCEPT,
    CANCEL,
  ];
  const filter = (reaction, user) =>
    user.id === message.author.id && nav.includes(reaction.emoji.name);

  return response.createReactionCollector(
      filter,
      options
  );
}


/**
 * respond to reaction collector 'collect' event
 * @param  {Message} response the bot's response message
 * @param  {Message} message  the originating message
 * @param  {Object} results youtube search API results object
 * @param  {function} selection function that returns selected song index
 * @param  {function} setSelection function to update selected song index
 * @return {function}
 */
function onCollect(response, message, results, selection, setSelection) {
  const commands = new Map([
    [NAV_UP, navUp],
    [NAV_DOWN, navDown],
    [ACCEPT, accept],
    [CANCEL, cancel],
  ]);

  return (reaction, reactionCollector) => {
    console.log(`Collected ${reaction.emoji.name}, `);
    if (commands.has(reaction.emoji.name)) {
      reaction.remove(message.author);
      setSelection(commands.get(reaction.emoji.name)({
        message: response,
        selection: selection(),
        results,
        collector: reactionCollector,
        reaction,
      }));
    }
  };
}

/**
 * respond to reaction collector 'end' event
 * @param  {function} resolve  promise resolve function
 * @param  {function} reject   promise reject function
 * @param  {Object} results youtube search API results object
 * @param  {Message} response the bot's response message
 * @param  {function} selection function that returns selected song index
 * @return {function}
 */
function onEnd(resolve, reject, results, response, selection) {
  return (collected, reason) => {
    console.log(`Collected ${collected.size} items`);
    if (reason === ACCEPT) {
      const result = YOUTUBE_VID_URL + results.items[selection()].id.videoId;
      resolve(result);
    } else {
      cleanMessage(response);
      reject(new Error('Search canceled by user'));
    }
  };
}

/**
 * create a text collector
 * @param  {Message} message  the originating message
 * @param  {Message} response the bot's response message
 * @param  {object} options  collector options
 * @return {Collector}
 */
function makeTxtCollector(message, response, options) {
  const reNumMatch = new RegExp(`\s?([1-${MAX_RESULTS}])[^\d]?\s?`);
  const txtFilter = (_message) =>
    _message.author.id === message.author.id &&
    reNumMatch.test(_message.content);

  return response.channel.createCollector(txtFilter, {
    maxMatches: 1,
    ...options,
  });
}

/**
 * respond to text collector 'collect' event
 * @param  {Message} message  the originating message
 * @param  {function} setSelection callback to update the selection index
 * @return {function}
 */
function onTextCollect(message, setSelection) {
  const reNumMatch = new RegExp(`\s?([1-${MAX_RESULTS}])[^\d]?\s?`);

  return (message) => {
    setSelection(parseInt(message.content.match(reNumMatch)[1]) - 1);
    cleanMessage(message);
  };
}

/**
 * respond to text collector 'end' event
 * @param {object} collector
 * @return {function}
 */
function onTextEnd(collector) {
  return (/* collected, reason */) => {
    collector.stop(ACCEPT);
  };
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
    let selection = 0;
    const setSelection = (index) => {
      selection = index;
    };
    const getSelection = () => selection;

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

    const collectorOptions = {
      time: 90 * 1000,
    };
    const collector = makeCollector(message, response, collectorOptions);

    collector.on('collect', onCollect(response, message, results, getSelection, setSelection));
    collector.on('end', onEnd(resolve, reject, results, response, getSelection));

    // Text collector
    const txtCollector = makeTxtCollector(message, response, collectorOptions);

    // Respond to user text input
    txtCollector.on('collect', onTextCollect(message, setSelection));
    txtCollector.on('end', onTextEnd(collector));
  });
}
